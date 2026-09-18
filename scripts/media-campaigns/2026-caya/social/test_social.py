"""Tests for Come As You Are social beats."""

from __future__ import annotations

import unittest

import config


class SocialConfigTest(unittest.TestCase):
    def test_beats_total_fifteen_seconds(self) -> None:
        total = sum(float(beat["seconds"]) for beat in config.BEATS)
        self.assertEqual(total, 15.0)

    def test_sunday_time_is_945(self) -> None:
        self.assertIn("9:45", config.SUNDAY)
        sunday = next(beat for beat in config.BEATS if beat["id"] == "03-sunday")
        texts = [line[0] for line in sunday["lines"]]
        self.assertIn("9:45 AM", texts)
        self.assertNotIn("10 AM", " ".join(texts))

    def test_each_beat_names_an_ebc_clip(self) -> None:
        for beat in config.BEATS:
            name = str(beat["clip"])
            self.assertTrue(name.startswith("ebc-"))
            self.assertTrue(name.endswith(".mp4"))


if __name__ == "__main__":
    unittest.main()
