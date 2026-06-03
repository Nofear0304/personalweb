import type { Metadata } from "next";
import { getFriends } from "@/lib/friends";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import SectionHeading from "@/components/ui/SectionHeading";
import FriendCard from "@/components/friends/FriendCard";

export const metadata: Metadata = {
  title: "朋友",
  description: "感谢相遇，欢迎交流",
};

export default function FriendsPage() {
  const friends = getFriends();

  return (
    <CosmicWrapper>
      <div className="max-w-[1400px] mx-auto px-5 py-16 sm:py-20">
        <SectionHeading
          label="Friends"
          title="朋友"
          description="感谢相遇，欢迎交流"
        />

        {friends.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8">
            {friends.map((friend, index) => (
              <FriendCard key={friend.name} friend={friend} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-[var(--muted)] text-lg">还没有朋友链接</p>
          </div>
        )}
      </div>
    </CosmicWrapper>
  );
}
