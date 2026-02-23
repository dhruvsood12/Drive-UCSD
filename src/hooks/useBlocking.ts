import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useBlocking = () => {
  const { user } = useAuth();
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [blockedByIds, setBlockedByIds] = useState<string[]>([]);

  const fetchBlocks = async () => {
    if (!user) return;
    
    const [{ data: blocked }, { data: blockedBy }] = await Promise.all([
      supabase.from('user_blocks').select('blocked_id').eq('blocker_id', user.id),
      supabase.from('user_blocks').select('blocker_id').eq('blocked_id', user.id),
    ]);

    setBlockedIds((blocked || []).map((b: any) => b.blocked_id));
    setBlockedByIds((blockedBy || []).map((b: any) => b.blocker_id));
  };

  useEffect(() => {
    fetchBlocks();
  }, [user?.id]);

  const blockUser = async (targetId: string) => {
    if (!user) return;
    await supabase.from('user_blocks').insert({ blocker_id: user.id, blocked_id: targetId } as any);
    await fetchBlocks();
  };

  const unblockUser = async (targetId: string) => {
    if (!user) return;
    await supabase.from('user_blocks').delete().eq('blocker_id', user.id).eq('blocked_id', targetId);
    await fetchBlocks();
  };

  const isBlocked = (targetId: string) => blockedIds.includes(targetId) || blockedByIds.includes(targetId);

  return { blockedIds, blockedByIds, blockUser, unblockUser, isBlocked, refreshBlocks: fetchBlocks };
};
