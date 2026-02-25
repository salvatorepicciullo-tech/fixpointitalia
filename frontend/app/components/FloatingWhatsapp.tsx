'use client';

import { useEffect, useState } from "react";

export default function FloatingWhatsapp() {

  // ⭐ STATO SCROLL
  const [scrolled, setScrolled] = useState(false);

  // ⭐ VISIBILITÀ RITARDATA (MOTION LIVELLO 2)
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 2000); // appare dopo 2 secondi

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ NUMERO WHATSAPP FIXPOINT
  const phone = "393517932176";

  const message = encodeURIComponent(
    "Ciao, ho bisogno di informazioni sulle riparazioni FixPoint."
  );

  const link = `https://wa.me/${phone}?text=${message}`;

  if (!visible) return null;

  return (
    <a
      href={link}
      target="_blank"
      className={`
        fixed bottom-[max(20px,env(safe-area-inset-bottom))]
        right-[max(20px,env(safe-area-inset-right))]
        z-[999]
        transition-all duration-500 ease-out
        ${scrolled ? "translate-y-[-4px] scale-105" : "translate-y-0"}
      `}
    >
      <img
        src="/whatsapp-fixpoint.png"
        alt="WhatsApp FixPoint"
        className="w-14 h-14 drop-shadow-xl"
      />
    </a>
  );
}