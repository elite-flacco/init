"use client";

import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { makeAuthenticatedRequest } from '../lib/auth';
import { Destination, EnhancedTravelPlan, TravelerType } from '../types/travel';
import { DestinationDetailsModal } from './DestinationDetailsModal';

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

  // Eager loading: Start loading user data immediately when user is authenticated
  // This makes sidebar opening feel instant since data is already loaded/loading
  useEffect(() => {
    if (user && !plansLoaded && !plansLoading) {
      loadSavedPlans();
    }
    if (user && !destinationsLoaded && !destinationsLoading) {
      loadSavedDestinations();
    }
  }, [user, plansLoaded, plansLoading, destinationsLoaded, destinationsLoading]);

  const loadSavedPlans = async () => {
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
  };

  const loadSavedDestinations = async () => {
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
  };

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
        <div className="flex items-center justify-between p-4 border-b border-border">
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
              className={`flex-1 flex items-center justify-center py-2 px-3 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-foreground-secondary hover:text-foreground hover:bg-background-muted'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {(activeTab === 'plans' || activeTab === 'destinations') && (
            // Search Bar
            <div className="p-4 border-b border-border">
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
                        onClick={() => openingPlanId !== plan.id && handleViewSavedPlan(plan)}
                        className={`bg-background-soft border border-border rounded-lg p-3 hover:bg-background-muted transition-colors group ${
                          openingPlanId === plan.id ? 'cursor-wait opacity-75' : 'cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium truncate group-hover:text-primary transition-colors">
                                {plan.name}
                              </p>
                              {openingPlanId === plan.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-foreground-secondary group-hover:text-primary transition-colors" />
                              )}
                              {plan.is_favorite && (
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <p className="text-xs mt-1">
                              {plan.destination.name}, {plan.destination.country}
                            </p>
                            <p className="text-xs text-foreground-secondary mt-1">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {new Date(plan.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Could add edit functionality here
                              console.log('Edit plan:', plan);
                            }}
                            className="p-1 hover:bg-background-muted rounded transition-colors"
                          >
                            <Edit3 className="w-3 h-3 text-foreground-secondary" />
                          </button>
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
                        onClick={() => handleViewDestinationDetails(item)}
                        className="bg-background-soft border border-border rounded-lg p-3 hover:bg-background-muted transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium group-hover:text-primary transition-colors">
                                {item.destination.name}
                              </p>
                              <ChevronRight className="w-3 h-3 text-foreground-secondary group-hover:text-primary transition-colors" />
                            </div>
                            <p className="text-xs text-foreground-secondary mt-1">
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {item.destination.country}
                            </p>
                            {item.notes && (
                              <p className="text-xs text-foreground-secondary mt-2 line-clamp-2">
                                {item.notes}
                              </p>
                            )}
                            <p className="text-xs text-foreground-secondary mt-2">
                              Saved {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Could add remove functionality here
                            }}
                            className="p-1 hover:bg-background-muted rounded transition-colors"
                          >
                            <Heart className="w-4 h-4 text-red-500 fill-current" />
                          </button>
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
    </div>
  );
}