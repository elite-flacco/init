import { TravelerType, Destination } from '../../../src/types/travel'
import { AITripPlanningResponse } from '../../../src/services/aiTripPlanningService'
import { promises as fs } from 'fs'
import path from 'path'

export interface SharedPlanData {
  id: string
  destination: Destination
  travelerType: TravelerType
  aiResponse: AITripPlanningResponse
  createdAt: string
  expiresAt: string
}

// File-based storage for development persistence
const STORAGE_FILE = path.join(process.cwd(), 'shared-plans.json')

// Persistent storage class that handles file I/O
export class PersistentSharedPlans {
  private memoryStore = new Map<string, SharedPlanData>()
  private initialized = false

  private async ensureInitialized() {
    if (this.initialized) return
    
    try {
      const fileContent = await fs.readFile(STORAGE_FILE, 'utf-8')
      const plans: SharedPlanData[] = JSON.parse(fileContent)
      
      // Clean up expired plans
      const now = new Date()
      const validPlans = plans.filter(plan => new Date(plan.expiresAt) > now)
      
      // Load valid plans into memory
      validPlans.forEach(plan => {
        this.memoryStore.set(plan.id, plan)
      })
      
      console.log(`Loaded ${validPlans.length} shared plans from storage`)
    } catch (error) {
      // File doesn't exist or is invalid, start with empty storage
      console.log('No existing shared plans found, starting with empty storage')
    }
    
    this.initialized = true
  }

  private async savePlansToFile() {
    try {
      const plansArray = Array.from(this.memoryStore.values())
      await fs.writeFile(STORAGE_FILE, JSON.stringify(plansArray, null, 2))
    } catch (error) {
      console.error('Error saving shared plans to file:', error)
    }
  }

  async set(key: string, value: SharedPlanData): Promise<this> {
    await this.ensureInitialized()
    this.memoryStore.set(key, value)
    await this.savePlansToFile()
    return this
  }

  async get(key: string): Promise<SharedPlanData | undefined> {
    await this.ensureInitialized()
    return this.memoryStore.get(key)
  }

  async delete(key: string): Promise<boolean> {
    await this.ensureInitialized()
    const result = this.memoryStore.delete(key)
    if (result) {
      await this.savePlansToFile()
    }
    return result
  }

  async has(key: string): Promise<boolean> {
    await this.ensureInitialized()
    return this.memoryStore.has(key)
  }

  async size(): Promise<number> {
    await this.ensureInitialized()
    return this.memoryStore.size
  }

  async keys(): Promise<string[]> {
    await this.ensureInitialized()
    return Array.from(this.memoryStore.keys())
  }
}

// Global instance
export const sharedPlansStore = new PersistentSharedPlans()

// Legacy export for compatibility
export const sharedPlans = new Map<string, SharedPlanData>()