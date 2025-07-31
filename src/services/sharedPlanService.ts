import { supabaseAdmin } from '../lib/supabase'
import { TravelerType, Destination } from '../types/travel'
import { AITripPlanningResponse } from './aiTripPlanningService'

export interface SharedPlanData {
  id: string
  destination: Destination
  travelerType: TravelerType
  aiResponse: AITripPlanningResponse
  createdAt: string
  expiresAt: string
}

export class SharedPlanService {
  /**
   * Create a new shared plan (server-side only with admin access)
   */
  static async createSharedPlan(data: {
    id: string
    destination: Destination
    travelerType: TravelerType
    aiResponse: AITripPlanningResponse
    expiresAt: string
  }): Promise<SharedPlanData> {
    if (!supabaseAdmin) {
      throw new Error('Service role key not configured - cannot create shared plans')
    }

    const now = new Date().toISOString()
    
    const sharedPlan: SharedPlanData = {
      ...data,
      createdAt: now,
    }

    // Use admin client for secure server-side operations
    const { error } = await supabaseAdmin
      .from('shared_plans')
      .insert({
        id: data.id,
        destination: data.destination,
        traveler_type: data.travelerType,
        ai_response: data.aiResponse,
        expires_at: data.expiresAt,
        created_at: now,
      })

    if (error) {
      throw new Error(`Failed to create shared plan: ${error.message}`)
    }

    return sharedPlan
  }

  /**
   * Get a shared plan by ID (server-side only with admin access)
   */
  static async getSharedPlan(id: string): Promise<SharedPlanData | null> {
    if (!supabaseAdmin) {
      throw new Error('Service role key not configured - cannot retrieve shared plans')
    }

    // Use admin client to bypass RLS and get accurate results
    const { data, error } = await supabaseAdmin
      .from('shared_plans')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null
      }
      throw new Error(`Failed to fetch shared plan: ${error.message}`)
    }

    if (!data) {
      return null
    }

    // Check if the plan has expired
    const now = new Date()
    const expiresAt = new Date(data.expires_at)

    if (now > expiresAt) {
      // Plan has expired, delete it
      await this.deleteSharedPlan(id)
      return null
    }

    // Transform database row back to our format
    const sharedPlan: SharedPlanData = {
      id: data.id,
      destination: data.destination,
      travelerType: data.traveler_type,
      aiResponse: data.ai_response,
      createdAt: data.created_at,
      expiresAt: data.expires_at,
    }

    return sharedPlan
  }

  /**
   * Delete a shared plan by ID (uses service role for admin access)
   */
  static async deleteSharedPlan(id: string): Promise<boolean> {
    if (!supabaseAdmin) {
      throw new Error('Service role key not configured - cannot delete shared plans')
    }
    
    const { error } = await supabaseAdmin
      .from('shared_plans')
      .delete()
      .eq('id', id)

    if (error) {
      return false
    }

    return true
  }

  /**
   * Clean up expired plans (uses service role for admin access)
   * Can be run periodically via cron job or API endpoint
   */
  static async cleanupExpiredPlans(): Promise<number> {
    if (!supabaseAdmin) {
      throw new Error('Service role key not configured - cannot cleanup expired plans')
    }

    const now = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('shared_plans')
      .delete()
      .lt('expires_at', now)
      .select('id')

    if (error) {
      return 0
    }

    const deletedCount = data?.length || 0
    return deletedCount
  }

  /**
   * Get statistics about shared plans (uses service role for admin access)
   */
  static async getStats(): Promise<{
    total: number
    expired: number
    active: number
  }> {
    if (!supabaseAdmin) {
      throw new Error('Service role key not configured - cannot get stats')
    }

    const now = new Date().toISOString()

    // Get total count
    const { count: total, error: totalError } = await supabaseAdmin
      .from('shared_plans')
      .select('*', { count: 'exact', head: true })

    // Get expired count
    const { count: expired, error: expiredError } = await supabaseAdmin
      .from('shared_plans')
      .select('*', { count: 'exact', head: true })
      .lt('expires_at', now)

    if (totalError || expiredError) {
      return { total: 0, expired: 0, active: 0 }
    }

    return {
      total: total || 0,
      expired: expired || 0,
      active: (total || 0) - (expired || 0),
    }
  }
}