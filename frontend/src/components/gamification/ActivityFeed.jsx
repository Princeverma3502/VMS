import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Zap, Award, TrendingUp, Trophy, Calendar } from 'lucide-react';
import api from '../../services/api';

const ActivityFeed = ({ limit = 20 }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [skip, setSkip] = useState(0);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/activity?limit=${limit}&skip=${skip}`);
      // Check if response.data.data exists, otherwise handle gracefully
      const newActivities = response.data.data || [];
      setActivities(prev => [...prev, ...newActivities]);
      setHasMore(response.data.hasMore);
    } catch (error) {
      console.error('Failed to fetch activity feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      xp_earned: <Zap className="text-yellow-600" size={20} fill="currentColor" />,
      task_completed: <Trophy className="text-blue-600" size={20} />,
      event_attended: <Calendar className="text-green-600" size={20} />,
      badge_earned: <Award className="text-purple-600" size={20} />,
      level_up: <TrendingUp className="text-red-600" size={20} />,
    };
    return icons[type] || <Trophy size={20} className="text-slate-600" />;
  };

  const handleLoadMore = () => {
    const newSkip = skip + limit;
    setSkip(newSkip);
    // Logic to fetch next page usually goes here or depends on useEffect with skip dependency
    // For manual load more, we call fetch directly:
    const fetchMore = async () => {
        try {
            const response = await api.get(`/activity?limit=${limit}&skip=${newSkip}`);
            setActivities(prev => [...prev, ...response.data.data]);
            setHasMore(response.data.hasMore);
        } catch (error) {
            console.error("Error loading more", error);
        }
    };
    fetchMore();
  };

  const handleLike = async (activityId) => {
    try {
      await api.put(`/activity/${activityId}/like`);
      // Update activity in state
      setActivities(
        activities.map((act) =>
          act._id === activityId 
            ? { ...act, likes: [...(act.likes || []), 'currentUserPlaceholder'] } // Simplified optimistic update
            : act
        )
      );
    } catch (error) {
      console.error('Failed to like activity:', error);
    }
  };

  if (loading && activities.length === 0) {
    return (
      <div className="text-center py-8 font-bold text-slate-500">
        <div className="inline-block animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full mb-2"></div>
        <p>Loading activity feed...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
        <TrendingUp size={24} className="text-blue-600" />
        Live Activity Feed
      </h2>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              {/* Icon Container */}
              <div className="flex-shrink-0 mt-1 w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                {getActivityIcon(activity.type)}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{activity.title}</h3>
                    {activity.userId && (
                      <p className="text-sm font-semibold text-slate-600">
                        {activity.userId.name}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {activity.description && (
                  <p className="text-sm text-slate-700 mt-2 font-medium leading-relaxed">
                    {activity.description}
                  </p>
                )}

                {/* Metadata Badge */}
                {activity.metadata && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs font-bold text-slate-700">
                    {activity.metadata.xpAmount && (
                        <div className="flex items-center gap-1 text-yellow-700 mb-1">
                            <Zap size={12} fill="currentColor"/> +{activity.metadata.xpAmount} XP earned
                        </div>
                    )}
                    {activity.metadata.newLevel && <p className="text-blue-700">Reached Level {activity.metadata.newLevel}</p>}
                    {activity.metadata.domainName && <p className="text-slate-600">Domain: {activity.metadata.domainName}</p>}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-6 mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleLike(activity._id)}
                    className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-red-500 transition-colors group"
                  >
                    <Heart size={18} className="group-hover:fill-red-500 transition-colors" />
                    {activity.likes?.length || 0}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-500 transition-colors">
                    <MessageCircle size={18} />
                    {activity.comments?.length || 0}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={handleLoadMore}
          className="w-full mt-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
        >
          Load More Activities
        </button>
      )}

      {activities.length === 0 && !loading && (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-300 bg-slate-50">
           <Trophy size={48} className="mx-auto text-slate-300 mb-2" />
           <p className="text-slate-500 font-bold">No activities yet.</p>
           <p className="text-sm text-slate-400">Start volunteering to see the action!</p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;