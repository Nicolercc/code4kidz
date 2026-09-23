import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { StreakBrokenOverlay } from "./App";
import { useGameStore } from "./store/gameStore";

describe("StreakBrokenOverlay", () => {
  it("shows and hides as the streak breaks and is dismissed, without crashing", () => {
    useGameStore.setState({ topicName: "Space", streakBrokenAfterDaysMissed: null, playedDates: [] });

    render(
      <MemoryRouter>
        <StreakBrokenOverlay />
      </MemoryRouter>,
    );
    expect(screen.queryByText(/your streak broke/i)).toBeNull();

    // What checkStreak does on app load after a streak of 2+ ends.
    act(() => useGameStore.setState({ streakBrokenAfterDaysMissed: 2 }));
    expect(screen.getByText(/your streak broke/i)).toBeTruthy();
    expect(screen.getByText(/gone for 2 days/i)).toBeTruthy();

    act(() => useGameStore.getState().dismissStreakBroken());
    expect(screen.queryByText(/your streak broke/i)).toBeNull();
  });
});
