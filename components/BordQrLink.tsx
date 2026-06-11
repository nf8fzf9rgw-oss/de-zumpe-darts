"use client";

interface BordQrLinkProps {
  bordNaam: string;
}

export default function BordQrLink({ bordNaam }: BordQrLinkProps) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/competitie#${encodeURIComponent(bordNaam)}`
      : `/competitie#${encodeURIComponent(bordNaam)}`;

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}`;

  return (
    <div className="rounded-lg border border-zinc-800 bg-black p-2 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- externe QR API */}
      <img
        src={qrSrc}
        alt={`QR ${bordNaam}`}
        width={80}
        height={80}
        className="mx-auto"
      />
      <p className="mt-1 text-[10px] text-zinc-500">{bordNaam}</p>
    </div>
  );
}
