"use client"

import * as React from "react"

const ACTIVE_SECTION_OFFSET_PX = 136
const ACTIVE_SECTION_TOLERANCE_PX = 24
const ACTIVE_SECTION_THRESHOLD_PX =
  ACTIVE_SECTION_OFFSET_PX + ACTIVE_SECTION_TOLERANCE_PX
const BOTTOM_SECTION_TRANSITION_PX = 640
const VIEWPORT_BOTTOM_PADDING_PX = 24
const SECTION_SCROLL_TARGET_PX = 144
const KEYBOARD_SCROLL_KEYS = new Set([
  "ArrowDown",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp",
  " ",
])

export function usePortfolioScrollSpy(sectionIds: readonly string[]) {
  const [activeSectionId, setActiveSectionId] = React.useState(
    sectionIds[0] ?? "",
  )
  const activeSectionIdRef = React.useRef(activeSectionId)
  const navigationTargetIdRef = React.useRef<string | null>(null)
  const scheduleActiveSectionSyncRef = React.useRef<() => void>(() => {})

  const updateHash = React.useCallback((id: string) => {
    const url = new URL(window.location.href)
    url.hash = id
    window.history.replaceState(null, "", url)
  }, [])

  const navigateToSection = React.useCallback(
    (id: string) => {
      const section = document.getElementById(id)
      if (!section) return

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches

      navigationTargetIdRef.current = id
      section.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      })
      window.requestAnimationFrame(() => {
        scheduleActiveSectionSyncRef.current()
      })
    },
    [],
  )

  React.useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null)

    if (sections.length === 0) return

    const hash = decodeURIComponent(window.location.hash.slice(1))
    const initialSection = sections.find((section) => section.id === hash)
    let initialNavigationPending = Boolean(initialSection)
    let initialFrameId: number | null = null
    let syncFrameId: number | null = null

    const syncActiveSection = () => {
      syncFrameId = null

      const maximumScrollY = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        0,
      )
      const remainingScrollY = Math.max(maximumScrollY - window.scrollY, 0)
      const isAtPageEnd = maximumScrollY > 0 && remainingScrollY <= 2
      const bottomTransitionDistance = Math.min(
        BOTTOM_SECTION_TRANSITION_PX,
        window.innerHeight * 0.75,
      )
      const bottomTransitionProgress =
        maximumScrollY > 0 && bottomTransitionDistance > 0
          ? 1 - Math.min(remainingScrollY / bottomTransitionDistance, 1)
          : 0
      const maximumSectionThreshold = Math.max(
        ACTIVE_SECTION_THRESHOLD_PX,
        window.innerHeight - VIEWPORT_BOTTOM_PADDING_PX,
      )
      const sectionThreshold =
        ACTIVE_SECTION_THRESHOLD_PX +
        (maximumSectionThreshold - ACTIVE_SECTION_THRESHOLD_PX) *
          bottomTransitionProgress
      const navigationTarget = navigationTargetIdRef.current
        ? sections.find(
            (section) => section.id === navigationTargetIdRef.current,
          )
        : undefined
      const navigationTargetTop =
        navigationTarget?.getBoundingClientRect().top
      const navigationTargetIsAligned =
        navigationTargetTop != null &&
        Math.abs(navigationTargetTop - SECTION_SCROLL_TARGET_PX) <=
          ACTIVE_SECTION_TOLERANCE_PX
      let visibleSection = sections[0]

      if (navigationTarget && (navigationTargetIsAligned || isAtPageEnd)) {
        visibleSection = navigationTarget

        if (
          navigationTargetIsAligned ||
          navigationTarget === sections.at(-1)
        ) {
          navigationTargetIdRef.current = null
        }
      } else {
        // Near the page end, move the activation line down gradually so the
        // remaining sections activate in order instead of jumping to the last.
        for (const section of sections) {
          if (section.getBoundingClientRect().top > sectionThreshold) {
            break
          }
          visibleSection = section
        }
      }

      if (!visibleSection || activeSectionIdRef.current === visibleSection.id) {
        return
      }

      activeSectionIdRef.current = visibleSection.id
      setActiveSectionId(visibleSection.id)
      updateHash(visibleSection.id)
    }

    const scheduleActiveSectionSync = () => {
      if (initialNavigationPending || syncFrameId !== null) return
      syncFrameId = window.requestAnimationFrame(syncActiveSection)
    }
    scheduleActiveSectionSyncRef.current = scheduleActiveSectionSync

    const clearNavigationTarget = () => {
      navigationTargetIdRef.current = null
    }
    const clearNavigationTargetOnKeyboardScroll = (event: KeyboardEvent) => {
      if (KEYBOARD_SCROLL_KEYS.has(event.key)) {
        clearNavigationTarget()
      }
    }

    if (initialSection) {
      navigationTargetIdRef.current = hash
      initialFrameId = window.requestAnimationFrame(() => {
        activeSectionIdRef.current = hash
        setActiveSectionId(hash)
        initialSection.scrollIntoView({ block: "start" })
        initialNavigationPending = false
        scheduleActiveSectionSync()
      })
    } else {
      scheduleActiveSectionSync()
    }

    const resizeObserver = new ResizeObserver(scheduleActiveSectionSync)

    window.addEventListener("scroll", scheduleActiveSectionSync, {
      passive: true,
    })
    window.addEventListener("resize", scheduleActiveSectionSync)
    window.addEventListener("wheel", clearNavigationTarget, { passive: true })
    window.addEventListener("touchstart", clearNavigationTarget, {
      passive: true,
    })
    window.addEventListener("keydown", clearNavigationTargetOnKeyboardScroll)
    sections.forEach((section) => {
      resizeObserver.observe(section)
    })

    return () => {
      resizeObserver.disconnect()
      scheduleActiveSectionSyncRef.current = () => {}
      window.removeEventListener("scroll", scheduleActiveSectionSync)
      window.removeEventListener("resize", scheduleActiveSectionSync)
      window.removeEventListener("wheel", clearNavigationTarget)
      window.removeEventListener("touchstart", clearNavigationTarget)
      window.removeEventListener(
        "keydown",
        clearNavigationTargetOnKeyboardScroll,
      )
      if (initialFrameId !== null) {
        window.cancelAnimationFrame(initialFrameId)
      }
      if (syncFrameId !== null) {
        window.cancelAnimationFrame(syncFrameId)
      }
    }
  }, [sectionIds, updateHash])

  return { activeSectionId, navigateToSection }
}
