"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  User, 
  MapPin, 
  Heart, 
  Settings, 
  LogOut, 
  Search, 
  Filter, 
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Tag,
  Star,
  Plane,
  ChevronRight,
  Loader2,
  Check,
  X as XIcon,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { makeAuthenticatedRequest } from '../lib/auth';
import { Destination, EnhancedTravelPlan, TravelerType } from '../types/travel';
import { DestinationDetailsModal } from './DestinationDetailsModal';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface UserSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal?: () => void;
}

interface SavedPlan {
  id: string;
  name: string;
  destination: Destination;
  created_at: string;
  updated_at: string;
  tags: string[];
  is_favorite: boolean;
  notes?: string;
  // traveler_type and ai_response are not included in list view for performance
}

interface SavedDestination {
  id: string;
  destination: Destination;
  notes: string;
  created_at: string;
  updated_at: string;
}

type SidebarTab = 'plans' | 'destinations' | 'profile' | 'settings';

export function UserSidebar({ isOpen, onClose, onOpenAuthModal }: UserSidebarProps) {
  const { user, signOut, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<SidebarTab>('plans');
  const [selectedDestination, setSelectedDestination] = useState<SavedDestination | null>(null);
  const [isDestinationModalOpen, setIsDestinationModalOpen] = useState(false);
  const [openingPlanId, setOpeningPlanId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [savedDestinations, setSavedDestinations] = useState<SavedDestination[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [destinationsLoading, setDestinationsLoading] = useState(false);
  const [plansLoaded, setPlansLoaded] = useState(false);
  const [destinationsLoaded, setDestinationsLoaded] = useState(false);

  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: 'plan' | 'destination' | null;
    item: SavedPlan | SavedDestination | null;
    isLoading: boolean;
  }>({ isOpen: false, type: null, item: null, isLoading: false });

  // Edit state for inline editing
  const [editingPlan, setEditingPlan] = useState<{
    id: string;
    name: string;
    notes: string;
    isLoading: boolean;
  } | null>(null);
  const [editingDestination, setEditingDestination] = useState<{
    id: string;
    notes: string;
    isLoading: boolean;
  } | null>(null);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Reset cache when user changes
  useEffect(() => {
    setPlansLoaded(false);
    setDestinationsLoaded(false);
    setSavedPlans([]);
    setSavedDestinations([]);
  }, [user?.id]);

  const loadSavedPlans = useCallback(async () => {
    if (!user) return;
    
    setPlansLoading(true);
    try {
      // Use the lightweight list endpoint for faster sidebar loading
      const response = await makeAuthenticatedRequest('/api/user/plans/list');
      if (response.ok) {
        const plans = await response.json();
        setSavedPlans(plans);
        setPlansLoaded(true);
      }
    } catch (error) {
      // Silently handle auth errors (user might be logging out)
      if (error instanceof Error && error.message.includes('No authentication token available')) {
        // This is expected during logout - just reset state
        setSavedPlans([]);
        setPlansLoaded(false);
      } else {
        console.error('Failed to load saved plans:', error);
      }
    } finally {
      setPlansLoading(false);
    }
  }, [user]);

  const loadSavedDestinations = useCallback(async () => {
    if (!user) return;
    
    setDestinationsLoading(true);
    try {
      const response = await makeAuthenticatedRequest('/api/user/destinations');
      if (response.ok) {
        const destinations = await response.json();
        setSavedDestinations(destinations);
        setDestinationsLoaded(true);
      }
    } catch (error) {
      // Silently handle auth errors (user might be logging out)
      if (error instanceof Error && error.message.includes('No authentication token available')) {
        // This is expected during logout - just reset state
        setSavedDestinations([]);
        setDestinationsLoaded(false);
      } else {
        console.error('Failed to load saved destinations:', error);
      }
    } finally {
      setDestinationsLoading(false);
    }
  }, [user]);

  // Eager loading: Start loading user data immediately when user is authenticated
  // This makes sidebar opening feel instant since data is already loaded/loading
  useEffect(() => {
    if (user && !plansLoaded && !plansLoading) {
      loadSavedPlans();
    }
    if (user && !destinationsLoaded && !destinationsLoading) {
      loadSavedDestinations();
    }
  }, [user, plansLoaded, plansLoading, destinationsLoaded, destinationsLoading, loadSavedPlans, loadSavedDestinations]);

  const handleSignOut = async () => {
    // Clear cached data on sign out
    setSavedPlans([]);
    setSavedDestinations([]);
    setPlansLoaded(false);
    setDestinationsLoaded(false);
    await signOut();
    onClose();
  };

  // Function to refresh data (can be called when new items are saved)
  const refreshUserData = async () => {
    setPlansLoaded(false);
    setDestinationsLoaded(false);
    if (user) {
      await Promise.all([loadSavedPlans(), loadSavedDestinations()]);
    }
  };

  const handleViewDestinationDetails = (destination: SavedDestination) => {
    setSelectedDestination(destination);
    setIsDestinationModalOpen(true);
  };

  const handleCloseDestinationModal = () => {
    setIsDestinationModalOpen(false);
    setSelectedDestination(null);
  };

  const handleSelectForPlanning = (destination: Destination) => {
    // This could integrate with the main app's planning flow
    // For now, just close the modal and sidebar
    handleCloseDestinationModal();
    onClose();
    console.log('Selected for planning:', destination);
  };

  const handleViewSavedPlan = async (plan: SavedPlan) => {
    setOpeningPlanId(plan.id);
    
    try {
      // First, get the full plan data including ai_response
      const fullPlanResponse = await makeAuthenticatedRequest(`/api/user/plans/${plan.id}`);
      if (!fullPlanResponse.ok) {
        throw new Error('Failed to fetch full plan data');
      }
      const fullPlan = await fullPlanResponse.json();

      // Create a temporary shared link for the saved plan
      const response = await fetch('/api/shared-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: fullPlan.destination,
          travelerType: fullPlan.traveler_type,
          aiResponse: fullPlan.ai_response,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create shareable link');
      }

      const { shareId } = await response.json();
      
      // Open the plan in a new tab
      const shareUrl = `${window.location.origin}/share/${shareId}`;
      window.open(shareUrl, '_blank');
      
    } catch (error) {
      console.error('Error viewing saved plan:', error);
      alert('Failed to open travel plan. Please try again.');
    } finally {
      setOpeningPlanId(null);
    }
  };

  const handleDeletePlan = async (plan: SavedPlan) => {
    setDeleteDialog({
      isOpen: true,
      type: 'plan',
      item: plan,
      isLoading: false
    });
  };

  const handleDeleteDestination = async (destination: SavedDestination) => {
    setDeleteDialog({
      isOpen: true,
      type: 'destination',
      item: destination,
      isLoading: false
    });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.item || !deleteDialog.type) return;

    setDeleteDialog(prev => ({ ...prev, isLoading: true }));

    try {
      const endpoint = deleteDialog.type === 'plan'
        ? `/api/user/plans/${deleteDialog.item.id}`
        : `/api/user/destinations/${deleteDialog.item.id}`;

      const response = await makeAuthenticatedRequest(endpoint, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${deleteDialog.type}`);
      }

      // Remove item from local state
      if (deleteDialog.type === 'plan') {
        setSavedPlans(prev => prev.filter(p => p.id !== deleteDialog.item!.id));
      } else {
        setSavedDestinations(prev => prev.filter(d => d.id !== deleteDialog.item!.id));
      }

      // Close dialog
      setDeleteDialog({ isOpen: false, type: null, item: null, isLoading: false });
      
    } catch (error) {
      console.error(`Error deleting ${deleteDialog.type}:`, error);
      alert(`Failed to delete ${deleteDialog.type}. Please try again.`);
      setDeleteDialog(prev => ({ ...prev, isLoading: false }));
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false, type: null, item: null, isLoading: false });
  };

  // Plan editing functions
  const handleEditPlan = (plan: SavedPlan) => {
    setEditingPlan({
      id: plan.id,
      name: plan.name,
      notes: plan.notes || '',
      isLoading: false
    });
  };

  const savePlan = async () => {
    if (!editingPlan) return;

    setEditingPlan(prev => prev ? { ...prev, isLoading: true } : null);

    try {
      const updateData = {
        name: editingPlan.name.trim(),
        notes: editingPlan.notes.trim()
      };

      const response = await makeAuthenticatedRequest(`/api/user/plans/${editingPlan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update plan');
      }

      // Update local state
      setSavedPlans(prev => 
        prev.map(plan => 
          plan.id === editingPlan.id 
            ? { ...plan, ...updateData }
            : plan
        )
      );

      setEditingPlan(null);
    } catch (error) {
      console.error('Error updating plan:', error);
      alert('Failed to update plan. Please try again.');
      setEditingPlan(prev => prev ? { ...prev, isLoading: false } : null);
    }
  };

  const cancelPlanEdit = () => {
    setEditingPlan(null);
  };

  // Destination editing functions
  const handleEditDestination = (destination: SavedDestination) => {
    setEditingDestination({
      id: destination.id,
      notes: destination.notes || '',
      isLoading: false
    });
  };

  const saveDestinationNotes = async () => {
    if (!editingDestination) return;

    setEditingDestination(prev => prev ? { ...prev, isLoading: true } : null);

    try {
      const response = await makeAuthenticatedRequest(`/api/user/destinations/${editingDestination.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: editingDestination.notes.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update destination notes');
      }

      // Update local state
      setSavedDestinations(prev => 
        prev.map(dest => 
          dest.id === editingDestination.id 
            ? { ...dest, notes: editingDestination.notes.trim() }
            : dest
        )
      );

      setEditingDestination(null);
    } catch (error) {
      console.error('Error updating destination notes:', error);
      alert('Failed to update destination notes. Please try again.');
      setEditingDestination(prev => prev ? { ...prev, isLoading: false } : null);
    }
  };

  const cancelDestinationEdit = () => {
    setEditingDestination(null);
  };

  const filteredPlans = savedPlans.filter(plan =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.destination.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDestinations = savedDestinations.filter(dest =>
    dest.destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.destination.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  // Show auth prompt if user is not authenticated
  if (!user && !loading) {
    return (
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

        {/* Sidebar */}
        <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Account Required</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-background-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-foreground-secondary" />
            </button>
          </div>

          {/* Auth Prompt */}
          <div className="flex flex-col items-center justify-center h-full p-6 -mt-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Save Your Travel Plans
                </h3>
                <p className="text-sm text-foreground-secondary mb-6">
                  Create an account to save your travel plans, bookmark destinations, and access them anytime.
                </p>
              </div>
              <button
                onClick={onOpenAuthModal}
                className="btn-3d-primary px-6 py-2.5 font-medium"
              >
                Sign In or Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Sidebar */}
      <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:px-4 sm:pb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {user?.full_name || user?.email}
              </h2>
              <p className="text-xs text-foreground-secondary">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-background-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-foreground-secondary" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {[
            { id: 'plans', label: 'My Trips', icon: Plane },
            { id: 'destinations', label: 'Destinations', icon: Heart },
            { id: 'profile', label: 'Profile', icon: User },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SidebarTab)}
              className={`flex-1 flex items-center justify-center py-2 px-3 text-xs font-medium rounded-none transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-foreground-secondary hover:text-foreground hover:bg-background-muted'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {(activeTab === 'plans' || activeTab === 'destinations') && (
            // Search Bar
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-secondary w-4 h-4" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab === 'plans' ? 'plans' : 'destinations'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-background-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {activeTab === 'plans' && (
              <div className="p-4">
                {plansLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-foreground-secondary">Loading your plans...</p>
                  </div>
                ) : filteredPlans.length > 0 ? (
                  <div className="space-y-3">
                    {filteredPlans.map(plan => (
                      <div 
                        key={plan.id} 
                        onClick={() => openingPlanId !== plan.id && !editingPlan && handleViewSavedPlan(plan)}
                        className={`bg-background-soft border border-border rounded-lg p-3 hover:bg-background-muted transition-colors group ${
                          openingPlanId === plan.id ? 'cursor-wait opacity-75' : editingPlan?.id === plan.id ? 'cursor-default' : 'cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              {editingPlan?.id === plan.id ? (
                                <div className="flex-1">
                                  <div className="space-y-3">
                                    {/* Name field */}
                                    <div>
                                      <label className="text-xs font-medium text-foreground-secondary block mb-1">
                                        Plan Name
                                      </label>
                                      <input
                                        type="text"
                                        value={editingPlan.name}
                                        onChange={(e) => setEditingPlan(prev => prev ? { ...prev, name: e.target.value } : null)}
                                        className="w-full text-sm font-medium bg-background border border-border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                                        placeholder="Enter plan name"
                                        disabled={editingPlan.isLoading}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Escape') cancelPlanEdit();
                                        }}
                                        autoFocus
                                      />
                                    </div>
                                    
                                    {/* Notes field */}
                                    <div>
                                      <label className="text-xs font-medium text-foreground-secondary block mb-1">
                                        Notes (optional)
                                      </label>
                                      <textarea
                                        ref={(textarea) => {
                                          if (textarea) {
                                            // Auto-adjust height to content
                                            textarea.style.height = 'auto';
                                            textarea.style.height = `${Math.max(60, Math.min(100, textarea.scrollHeight))}px`;
                                          }
                                        }}
                                        value={editingPlan.notes}
                                        onChange={(e) => {
                                          setEditingPlan(prev => prev ? { ...prev, notes: e.target.value } : null);
                                          // Auto-adjust height on content change
                                          const textarea = e.target as HTMLTextAreaElement;
                                          textarea.style.height = 'auto';
                                          textarea.style.height = `${Math.max(60, Math.min(100, textarea.scrollHeight))}px`;
                                        }}
                                        className="w-full text-xs bg-background border border-border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent resize-y min-h-[60px] max-h-[100px]"
                                        placeholder="Add notes about this travel plan..."
                                        disabled={editingPlan.isLoading}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && e.metaKey) savePlan();
                                          if (e.key === 'Escape') cancelPlanEdit();
                                        }}
                                      />
                                    </div>
                                    
                                    {/* Action buttons */}
                                    <div className="flex items-center justify-end space-x-2">
                                      <button
                                        onClick={cancelPlanEdit}
                                        disabled={editingPlan.isLoading}
                                        className="px-3 py-1.5 text-xs text-foreground-secondary hover:text-foreground hover:bg-background-muted rounded transition-colors disabled:opacity-50"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={savePlan}
                                        disabled={editingPlan.isLoading || !editingPlan.name.trim()}
                                        className="px-3 py-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                      >
                                        {editingPlan.isLoading ? (
                                          <>
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            <span className="text-xs text-white">Saving...</span>
                                          </>
                                        ) : (
                                          <span className="text-xs text-white">Save</span>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="font-medium truncate group-hover:text-primary transition-colors">
                                    {plan.name}
                                  </p>
                                  {openingPlanId === plan.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 flex-shrink-0 text-foreground-secondary group-hover:text-primary transition-colors" />
                                  )}
                                  {plan.is_favorite && (
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  )}
                                </>
                              )}
                            </div>
                            {editingPlan?.id !== plan.id && (
                              <>
                                <p className="text-xs mt-1">
                                  {plan.destination.name}
                                </p>
                                {plan.notes && (
                                  <p className="text-xs text-foreground-secondary mt-2 line-clamp-2">
                                    {plan.notes}
                                  </p>
                                )}
                                <p className="text-xs text-foreground-secondary mt-1">
                                  <Calendar className="w-3 h-3 inline mr-1" />
                                  {new Date(plan.created_at).toLocaleDateString()}
                                </p>
                              </>
                            )}
                          </div>
                          {editingPlan?.id !== plan.id && (
                            <div className="flex items-center space-x-1">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditPlan(plan);
                                }}
                                className="p-1 hover:bg-background-muted rounded transition-colors"
                                title="Edit plan"
                              >
                                <Edit3 className="w-3 h-3 text-foreground-secondary" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePlan(plan);
                                }}
                                className="p-1 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
                                title="Delete plan"
                              >
                                <Trash2 className="w-3 h-3 text-foreground-secondary" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Plane className="w-12 h-12 text-foreground-secondary mx-auto mb-3 opacity-50" />
                    <h3 className="text-sm font-medium text-foreground mb-2">No saved plans yet</h3>
                    <p className="text-xs text-foreground-secondary mb-4">
                      Create your first travel plan to see it here!
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'destinations' && (
              <div className="p-4">
                {destinationsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-foreground-secondary">Loading destinations...</p>
                  </div>
                ) : filteredDestinations.length > 0 ? (
                  <div className="space-y-3">
                    {filteredDestinations.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => !editingDestination && handleViewDestinationDetails(item)}
                        className={`bg-background-soft border border-border rounded-lg p-3 hover:bg-background-muted transition-colors group ${
                          editingDestination?.id === item.id ? 'cursor-default' : 'cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium group-hover:text-primary transition-colors">
                                {item.destination.name}
                              </p>
                              {editingDestination?.id !== item.id && (
                                <ChevronRight className="w-4 h-4 flex-shrink-0 text-foreground-secondary group-hover:text-primary transition-colors" />
                              )}
                            </div>
                            <p className="text-xs text-foreground-secondary mt-1">
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {item.destination.country}
                            </p>
                            {editingDestination?.id === item.id ? (
                              <div className="mt-2">
                                <div>
                                  <label className="text-xs font-medium text-foreground-secondary block mb-1">
                                    Notes
                                  </label>
                                  <textarea
                                    ref={(textarea) => {
                                      if (textarea) {
                                        // Auto-adjust height to content
                                        textarea.style.height = 'auto';
                                        textarea.style.height = `${Math.max(60, Math.min(100, textarea.scrollHeight))}px`;
                                      }
                                    }}
                                    value={editingDestination.notes}
                                    onChange={(e) => {
                                      setEditingDestination(prev => prev ? { ...prev, notes: e.target.value } : null);
                                      // Auto-adjust height on content change
                                      const textarea = e.target as HTMLTextAreaElement;
                                      textarea.style.height = 'auto';
                                      textarea.style.height = `${Math.max(60, Math.min(100, textarea.scrollHeight))}px`;
                                    }}
                                    className="w-full text-xs bg-background border border-border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent resize-y min-h-[60px] max-h-[100px]"
                                    placeholder="Add your notes about this destination..."
                                    disabled={editingDestination.isLoading}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && e.metaKey) saveDestinationNotes();
                                      if (e.key === 'Escape') cancelDestinationEdit();
                                    }}
                                    autoFocus
                                  />
                                </div>
                                
                                {/* Action buttons */}
                                <div className="flex items-center justify-end space-x-2 mt-3">
                                  <button
                                    onClick={cancelDestinationEdit}
                                    disabled={editingDestination.isLoading}
                                    className="px-3 py-1.5 text-xs text-foreground-secondary hover:text-foreground hover:bg-background-muted rounded transition-colors disabled:opacity-50"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={saveDestinationNotes}
                                    disabled={editingDestination.isLoading}
                                    className="px-3 py-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                  >
                                    {editingDestination.isLoading ? (
                                      <>
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        <span className="text-xs text-white">Saving...</span>
                                      </>
                                    ) : (
                                      <span className="text-xs text-white">Save</span>
                                    )}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {item.notes && (
                                  <p className="text-xs text-foreground-secondary mt-2 line-clamp-2">
                                    {item.notes}
                                  </p>
                                )}
                                <p className="text-xs text-foreground-secondary mt-2">
                                  Saved {new Date(item.created_at).toLocaleDateString()}
                                </p>
                              </>
                            )}
                          </div>
                          {editingDestination?.id !== item.id && (
                            <div className="flex items-center space-x-1">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditDestination(item);
                                }}
                                className="p-1 hover:bg-background-muted rounded transition-colors"
                                title="Edit notes"
                              >
                                <Edit3 className="w-3 h-3 text-foreground-secondary" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDestination(item);
                                }}
                                className="p-1 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
                                title="Remove from saved destinations"
                              >
                                <Trash2 className="w-3 h-3 text-foreground-secondary" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-foreground-secondary mx-auto mb-3 opacity-50" />
                    <h3 className="text-sm font-medium text-foreground mb-2">No saved destinations</h3>
                    <p className="text-xs text-foreground-secondary mb-4">
                      Save destinations you're interested in to see them here!
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="p-4 space-y-6">
                {/* Profile Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Profile Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-foreground-secondary">Username</label>
                      <p className="text-sm text-foreground mt-1">{user?.full_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground-secondary">Email</label>
                      <p className="text-sm text-foreground mt-1">{user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground-secondary">Member Since</label>
                      <p className="text-sm text-foreground mt-1">
                        {new Date(user?.created_at || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Your Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-background-soft rounded-lg border border-border">
                      <div className="text-lg font-semibold text-foreground">{savedPlans.length}</div>
                      <div className="text-xs text-foreground-secondary">Trips</div>
                    </div>
                    <div className="text-center p-3 bg-background-soft rounded-lg border border-border">
                      <div className="text-lg font-semibold text-foreground">{savedDestinations.length}</div>
                      <div className="text-xs text-foreground-secondary">Destinations</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <button className="w-full flex items-center space-x-3 p-3 text-sm text-foreground hover:bg-background-muted rounded-lg transition-colors">
                    <Settings className="w-4 h-4 text-foreground-secondary" />
                    <span>Account Settings</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-3 p-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Destination Details Modal */}
      {selectedDestination && (
        <DestinationDetailsModal
          destination={selectedDestination.destination}
          isOpen={isDestinationModalOpen}
          onClose={handleCloseDestinationModal}
          onSelectForPlanning={handleSelectForPlanning}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={`Delete ${deleteDialog.type === 'plan' ? 'Travel Plan' : 'Saved Destination'}?`}
        message={
          deleteDialog.type === 'plan' && deleteDialog.item
            ? `Are you sure you want to delete "${(deleteDialog.item as SavedPlan).name}"? This action cannot be undone.`
            : deleteDialog.type === 'destination' && deleteDialog.item
            ? `Are you sure you want to remove "${(deleteDialog.item as SavedDestination).destination.name}" from your saved destinations? This action cannot be undone.`
            : 'Are you sure you want to delete this item?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteDialog.isLoading}
      />
    </div>
  );
}