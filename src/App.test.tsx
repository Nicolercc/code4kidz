import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { StreakBrokenOverlay } from "./App";
import { useGameStore } from "./store/gameStore";

describe("StreakBrokenOverlay", () => {
  it("shows and hides as the streak breaks and is dismissed, without crashing", () => {
    useGameStore.setState({ topicName: "Space", streakJustBroke: false, lastPlayedDate: "" });

    render(
      <MemoryRouter>
        <StreakBrokenOverlay />
      </MemoryRouter>,
    );
    expect(screen.queryByText(/your streak broke/i)).toBeNull();

    // This is what checkAndUpdateStreak does on app load after 2+ missed days.
    act(() => useGameStore.setState({ streakJustBroke: true }));
    expect(screen.getByText(/your streak broke/i)).toBeTruthy();

    act(() => useGameStore.getState().dismissStreakBroken());
    expect(screen.queryByText(/your streak broke/i)).toBeNull();
  });
});
