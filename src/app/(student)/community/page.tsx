// src/app/(student)/community/page.tsx
'use client';

export default function DiscordCommunityPage() {
  return (
    <div className="-m-4 md:-m-6 lg:-m-8 h-[calc(100vh-5rem)] md:h-[calc(100vh-5.5rem)] lg:h-[calc(100vh-6rem)] bg-navy-dark overflow-hidden">
      <iframe
        src="https://e.widgetbot.io/channels/1523655693343789196/1523655695608840277"
        className="w-full h-full border-none"
        allowFullScreen
        allow="clipboard-write; fullscreen"
        title="CIST Community Discord Server"
      />
    </div>
  );
}
