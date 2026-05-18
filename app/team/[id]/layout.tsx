"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { TeamSidebar } from "@/components/layout/TeamSidebar";
import { TeamHeader } from "@/components/layout/TeamHeader";
import { useTeamStore } from "@/stores/team-store";

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ id: string }>();
  const teamId = params?.id ?? "";
  const fetchTeamDetail = useTeamStore((s) => s.fetchTeamDetail);
  const clearCurrentTeam = useTeamStore((s) => s.clearCurrentTeam);

  useEffect(() => {
    if (teamId) fetchTeamDetail(teamId);
    return () => {
      clearCurrentTeam();
    };
  }, [teamId, fetchTeamDetail, clearCurrentTeam]);

  return (
    <div className="flex h-screen overflow-hidden bg-paper text-ink">
      <TeamSidebar teamId={teamId} />
      <div className="flex flex-1 flex-col min-w-0">
        <TeamHeader teamId={teamId} />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-[80rem] px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
