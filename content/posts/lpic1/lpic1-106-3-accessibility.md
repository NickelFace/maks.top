---
title: "LPIC-1 106.3 — Accessibility"
date: 2026-04-20
description: "Desktop accessibility settings, keyboard and mouse assist (Sticky/Bounce/Slow keys, Mouse Keys, xkbset), visual impairments (High Contrast, screen magnifier, Orca screen reader). LPIC-1 exam topic 106.3."
tags: ["Linux", "LPIC-1", "accessibility", "Orca", "xkbset", "desktop"]
categories: ["LPIC-1"]
page_lang: "en"
lang_pair: "/posts/lpic1/ru/lpic1-106-3-accessibility/"
---

> **Exam weight: 1** — LPIC-1 v5, Exam 102

## What You Need to Know

From the official LPIC-1 objectives:

- Basic knowledge of visual settings and themes.
- Basic knowledge of assistive technology.

Key terms: High Contrast/Large Print Desktop Themes, Screen Reader, Braille Display, Screen Magnifier, On-Screen Keyboard, Sticky/Repeat keys, Slow/Bounce/Toggle keys, Mouse keys, Gestures, Voice recognition.

---

## Accessibility Settings

The Linux desktop provides settings and tools to adapt the user interface for people with disabilities. The standard interface devices — screen, keyboard, and mouse/touchpad — can each be reconfigured to overcome visual impairments or reduced mobility.

Accessibility settings are found in the system configuration panel:

| Desktop | Location |
|---|---|
| GNOME | **Universal Access** |
| KDE | **System Settings → Personalization → Accessibility** |
| Xfce | **Accessibility** (reduced feature set compared to GNOME/KDE) |

GNOME can be configured to permanently show the **Universal Access** menu in the top-right corner of the screen for quick switching. The **visual bell** feature (called *visual bell* in KDE) replaces sound alerts with a visual cue — useful for users with hearing impairments.

---

## Keyboard and Mouse Assist

### Sticky Keys

Allows typing keyboard shortcuts one key at a time. When enabled, combinations like `Ctrl+C` do not need to be held simultaneously — press `Ctrl`, release it, then press `C`.

- GNOME: **Typing Assist** section of Universal Access.
- KDE: **Modifier Keys** tab of Accessibility. KDE also offers **Locking Keys** — `Alt`, `Ctrl`, `Shift` stay "down" if pressed twice (like Caps Lock).

### Bounce Keys

Inhibits unintended key presses by placing a delay between them. A new key press is accepted only after a specified time has passed since the last one. Useful for users with hand tremors.

- GNOME: applies only to repeated same-key presses.
- KDE: applies to any key press; found in the **Keyboard Filters** tab.

### Slow Keys

Requires the user to hold down a key for a specified time before it is accepted, preventing accidental keystrokes.

### Activation Gestures

Sticky Keys and Slow Keys can be toggled on/off via keyboard gestures:
- **Sticky Keys**: press `Shift` five consecutive times.
- **Slow Keys**: hold `Shift` for eight consecutive seconds.

In KDE, the option is called **Use gestures for activating sticky keys and slow keys**. In GNOME it is called **Enable by Keyboard** in the Typing Assist window.

### AccessX and xkbset

Sticky keys, Bounce keys, Slow keys, and Mouse Keys are accessibility features provided by **AccessX**, a resource within the X Keyboard Extension (XKB). AccessX settings can also be modified from the command line with the `xkbset` command.

### Mouse Keys

Allows controlling the mouse pointer with the **numerical keypad**:
- `2` — move down, `4` — move left, `7` — move northwest, etc.
- `5` — left mouse click (default).

- GNOME: a single switch in Universal Access.
- KDE: **System Settings → Mouse → Keyboard Navigation**; speed and acceleration can be customized.

### Screen Keyboard

When physical keyboard usage is impossible or uncomfortable, an on-screen keyboard can be used:

- GNOME: **Screen Keyboard** switch in Universal Access — appears whenever the cursor is in a text field.
- KDE and others: the **onboard** package provides a simple on-screen keyboard for any desktop environment.

### Mouse Click Assist

If clicking or dragging causes pain or is impractical:

- GNOME **Click Assist**:
  - *Simulate a right mouse click* — hold left button to generate a right-click.
  - *Simulate clicking by hovering* — click triggered when mouse stays still.
- KDE: **KMouseTool** application provides the same features.

---

## Visual Impairments

### High Contrast Theme

Makes windows and buttons easier to see by drawing them in sharper colors. Available in GNOME's **Seeing** section of Universal Access and in most other desktop environments' appearance settings.

### Large Text

Enlarges the standard screen font size.

### Cursor Size

Allows choosing a bigger mouse cursor to make it easier to locate on the screen.

### Screen Magnifier

For users who need to zoom in on parts of the screen:

- GNOME: **Zoom** in Universal Access — configurable magnification ratio, magnifier position, and color adjustments.
- KDE: **KMagnifier** application (available via the application launcher).
- Xfce: zooms in and out by rotating the mouse scroll wheel while `Alt` is held.

### Screen Reader

For users who cannot use the graphical interface visually, a **screen reader** generates a synthesized voice to report screen events and read the text under the mouse cursor.

The most popular screen reader for Linux is **Orca**, usually installed by default. Orca also works with **refreshable braille displays** — special devices that display braille characters by raising small pins felt with the fingertips.

---

## Quick Reference

```
Keyboard accessibility features (AccessX / XKB):
  Sticky Keys    type shortcuts one key at a time (Ctrl, then C)
  Bounce Keys    delay between presses; rejects rapid repeats (hand tremors)
  Slow Keys      must hold key for set time before it registers
  Mouse Keys     control mouse pointer with numpad (5 = left click)

Activation Gestures (toggle via keyboard):
  Sticky Keys    press Shift 5 times in a row
  Slow Keys      hold Shift for 8 seconds

Command-line AccessX control:
  xkbset         modify AccessX settings from the terminal

On-screen keyboard:
  GNOME          Screen Keyboard switch in Universal Access
  KDE/others     onboard package

Visual accessibility:
  High Contrast    sharper colors for windows and buttons
  Large Text       enlarged font size
  Cursor Size      bigger mouse cursor
  Zoom (GNOME)     screen magnifier — configurable ratio, position, colors
  KMagnifier       KDE screen magnifier application
  Orca             screen reader — synthesized voice + refreshable braille display support

Accessibility settings location:
  GNOME    Universal Access
  KDE      System Settings → Personalization → Accessibility
  Xfce     Accessibility (reduced feature set)
```

---

## Exam Questions

1. What accessibility feature allows typing key combinations one key at a time? → **Sticky Keys**
2. What does Bounce Keys do? → Adds a delay between key presses so rapid accidental repeats (e.g. from hand tremors) are rejected.
3. What does Slow Keys do? → Requires the key to be held for a set time before it is accepted.
4. What is the keyboard gesture to enable Sticky Keys? → Press `Shift` **five consecutive times**.
5. What is the keyboard gesture to enable Slow Keys? → Hold `Shift` for **eight seconds**.
6. What command-line tool modifies AccessX settings? → `xkbset`
7. What extension of the X Window System provides Sticky, Bounce, Slow, and Mouse Keys? → **AccessX** (within XKB — X Keyboard Extension)
8. How does Mouse Keys work? → The numerical keypad controls the mouse pointer; `5` = left click by default.
9. What package provides an on-screen keyboard for any desktop environment? → **onboard**
10. In GNOME, where are accessibility settings found? → **Universal Access**
11. In KDE, where are accessibility settings found? → **System Settings → Personalization → Accessibility**
12. What GNOME feature replaces sound alerts with visual cues? → **Visual bell** (visual alert)
13. What does High Contrast do? → Draws windows and buttons in sharper colors to improve visibility.
14. What GNOME screen magnifier feature is called? → **Zoom** (in Universal Access)
15. What KDE screen magnification application is available? → **KMagnifier**
16. What is the most popular screen reader for Linux? → **Orca**
17. What additional device does Orca support besides the screen? → **Refreshable braille displays**
18. What KDE application assists mouse clicks by clicking when the cursor pauses? → **KMouseTool**

---

## Exercises

### Exercise 1 — Sticky Keys for Alt+Tab

What accessibility feature could help a user to alternate between open windows using the keyboard, considering that the user is unable to press `Alt` and `Tab` at the same time?

<details>
<summary>Answer</summary>

**Sticky Keys** — allows pressing keyboard shortcuts one key at a time. The user can press `Alt`, release it, then press `Tab` without holding both simultaneously.

</details>

---

### Exercise 2 — Bounce Keys and Hand Tremors

How could the Bounce Keys accessibility feature help users whose involuntary hand tremors disturb their typing?

<details>
<summary>Answer</summary>

Bounce Keys places a delay between accepted key presses. A new key press is accepted only after a specified time has passed since the last one. Tremor-induced accidental rapid repeats of the same key are therefore rejected, reducing unwanted characters in typed text.

</details>

---

### Exercise 3 — Activation Gesture for Sticky Keys

What is the most common Activation Gesture for the Sticky Keys accessibility feature?

<details>
<summary>Answer</summary>

Pressing the `Shift` key **five consecutive times** activates Sticky Keys (when Activation Gestures are enabled). To activate Slow Keys, hold `Shift` for eight consecutive seconds.

</details>

---

### Exercise 4 — KDE Mouse Click Assist

In KDE, what application helps users with repetitive strain injuries by automatically clicking the mouse whenever the cursor pauses briefly?

<details>
<summary>Answer</summary>

**KMouseTool** — it monitors the mouse cursor position and simulates a click when the cursor remains still for a set interval, reducing the need to physically click the mouse button.

</details>

---

### Exercise 5 — Visual Adjustments for Readability

What appearance aspects of the graphical environment can be modified to make it easier for people to read text on the screen?

<details>
<summary>Answer</summary>

- **High Contrast theme** — sharper color distinction between interface elements.
- **Large Text** — enlarges the standard screen font size.
- **Cursor Size** — bigger cursor is easier to locate.
- **Screen Magnifier** (Zoom in GNOME, KMagnifier in KDE) — zooms into any part of the screen with configurable magnification ratio.

</details>

---

*LPIC-1 Study Notes | Topic 106: User Interfaces and Desktops*
