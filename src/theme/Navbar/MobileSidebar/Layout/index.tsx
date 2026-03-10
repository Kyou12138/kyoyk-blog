import React, {type ReactNode, useEffect, useRef} from "react";
import clsx from "clsx";
import {useLocation} from "@docusaurus/router";
import {
  useNavbarMobileSidebar,
  useNavbarSecondaryMenu,
} from "@docusaurus/theme-common/internal";
import type {Props} from "@theme/Navbar/MobileSidebar/Layout";

export default function NavbarMobileSidebarLayout({
  header,
  primaryMenu,
  secondaryMenu,
}: Props): ReactNode {
  const {shown: secondaryMenuShown} = useNavbarSecondaryMenu();
  const mobileSidebar = useNavbarMobileSidebar();
  const {pathname} = useLocation();
  const itemsRef = useRef<HTMLDivElement | null>(null);

  const allowSecondaryMenu = pathname.startsWith("/docs");
  const showSecondaryMenu = secondaryMenuShown && allowSecondaryMenu;

  useEffect(() => {
    if (!mobileSidebar.shown) {
      return;
    }
    const items = itemsRef.current;
    if (!items) {
      return;
    }
    const resetScroll = () => {
      items.scrollLeft = 0;
    };
    resetScroll();
    const raf = window.requestAnimationFrame(resetScroll);
    const timeout = window.setTimeout(resetScroll, 120);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
    };
  }, [mobileSidebar.shown, showSecondaryMenu]);

  return (
    <div className="navbar-sidebar">
      {header}
      <div
        ref={itemsRef}
        className={clsx("navbar-sidebar__items", {
          "navbar-sidebar__items--show-secondary": showSecondaryMenu,
        })}
      >
        <div className="navbar-sidebar__item menu">{primaryMenu}</div>
        <div className="navbar-sidebar__item menu">{secondaryMenu}</div>
      </div>
    </div>
  );
}
