import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Megaphone, FileText, Image, Users, ArrowRight, Plus, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Helmet } from 'react-helmet-async';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';

interface Stats {
  announcements: number;
  schemes: number;
  notices: number;
  galleryImages: number;
  members: number;
}

interface RecentItem {
  id: string;
  title: string;
  type: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [ann, sch, not, img, mem] = await Promise.all([
        supabase.from('announcements').select('id', { count: 'exact', head: true }),
        supabase.from('schemes').select('id', { count: 'exact', head: true }),
        supabase.from('notices').select('id', { count: 'exact', head: true }),
        supabase.from('gallery_images').select('id', { count: 'exact', head: true }),
        supabase.from('panchayat_members').select('id', { count: 'exact', head: true }),
      ]);
      return {
        announcements: ann.count || 0,
        schemes: sch.count || 0,
        notices: not.count || 0,
        galleryImages: img.count || 0,
        members: mem.count || 0,
      };
    },
  });

  const { data: recent = [], isLoading: recentLoading } = useQuery<RecentItem[]>({
    queryKey: ['admin-recent'],
    queryFn: async () => {
      const [ann, sch, not] = await Promise.all([
        supabase.from('announcements').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('schemes').select('id, name, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('notices').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      const items: RecentItem[] = [
        ...(ann.data || []).map((a: { id: string; title: string; created_at: string }) => ({ id: a.id, title: a.title, type: 'Announcement', created_at: a.created_at })),
        ...(sch.data || []).map((s: { id: string; name: string; created_at: string }) => ({ id: s.id, title: s.name, type: 'Scheme', created_at: s.created_at })),
        ...(not.data || []).map((n: { id: string; title: string; created_at: string }) => ({ id: n.id, title: n.title, type: 'Notice', created_at: n.created_at })),
      ];
      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return items.slice(0, 5);
    },
  });

  const statCards = [
    { label: 'Announcements', count: stats?.announcements ?? 0, icon: Megaphone, path: '/admin/announcements' },
    { label: 'Schemes', count: stats?.schemes ?? 0, icon: FileText, path: '/admin/schemes' },
    { label: 'Notices', count: stats?.notices ?? 0, icon: FileText, path: '/admin/notices' },
    { label: 'Gallery Images', count: stats?.galleryImages ?? 0, icon: Image, path: '/admin/gallery' },
    { label: 'Members', count: stats?.members ?? 0, icon: Users, path: '/admin/members' },
  ];

  const quickActions = [
    { label: 'Add Announcement', path: '/admin/announcements' },
    { label: 'Add Scheme', path: '/admin/schemes' },
    { label: 'Add Notice', path: '/admin/notices' },
    { label: 'Upload Photo', path: '/admin/gallery' },
  ];

  if (statsLoading) return <LoadingSpinner size={32} className="py-20" />;

  return (
    <>
      <Helmet>
        <title>Dashboard — Admin</title>
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-primary-900">Dashboard</h1>
          <p className="text-sm text-primary-500 mt-1">Overview of portal content and quick actions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((stat) => (
            <Link key={stat.label} to={stat.path}>
              <Card hover className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                    <stat.icon size={20} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-primary-900">{stat.count}</p>
                <p className="text-sm text-primary-500 mt-0.5">{stat.label}</p>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-primary-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.path} to={action.path}>
                <Card hover className="p-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-primary-700 flex items-center gap-2">
                    <Plus size={16} className="text-accent-saffron" />
                    {action.label}
                  </span>
                  <ArrowRight size={18} className="text-primary-400" />
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-primary-500" />
            Recent Activity
          </h2>
          <Card className="divide-y divide-primary-50">
            {recentLoading ? (
              <div className="p-8"><LoadingSpinner size={24} /></div>
            ) : recent.length === 0 ? (
              <div className="p-8 text-center text-sm text-primary-400">No recent activity yet.</div>
            ) : (
              recent.map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-primary-50/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-primary-900">{item.title}</p>
                    <p className="text-xs text-primary-400">{item.type}</p>
                  </div>
                  <span className="text-xs text-primary-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
