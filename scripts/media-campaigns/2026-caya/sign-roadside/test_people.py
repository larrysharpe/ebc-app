"""Tests for Come As You Are people B-roll helpers."""

from __future__ import annotations

import unittest

from PIL import Image

import config
import people


class PeopleHelpersTest(unittest.TestCase):
    def test_every_copy_beat_has_a_clip(self) -> None:
        ids = {beat["id"] for beat in config.BEATS}
        clip_ids = {clip["beat_id"] for clip in config.PEOPLE_CLIPS}
        self.assertEqual(ids, clip_ids)

    def test_clip_for_beat_returns_named_file(self) -> None:
        clip = people.clip_for_beat("01-come-as-you-are", config.PEOPLE_CLIPS)
        assert clip is not None
        self.assertEqual(clip["file"], "greeting-congregation.mp4")

    def test_clip_for_beat_unknown_is_none(self) -> None:
        self.assertIsNone(people.clip_for_beat("missing", config.PEOPLE_CLIPS))

    def test_veil_alpha_stays_in_readable_range(self) -> None:
        self.assertEqual(people.veil_alpha(0.01), 0.15)
        self.assertEqual(people.veil_alpha(0.99), 0.85)
        self.assertEqual(people.veil_alpha(0.52), 0.52)

    def test_blend_people_moves_toward_burgundy(self) -> None:
        white = Image.new("RGB", (8, 8), (255, 255, 255))
        blended = people.blend_people(white, config.BURGUNDY, 0.5)
        pixel = blended.getpixel((0, 0))
        self.assertLess(pixel[0], 220)
        self.assertGreater(pixel[0], 80)

    def test_stack_with_shadow_grows_canvas(self) -> None:
        stack = Image.new("RGBA", (40, 20), (255, 255, 255, 255))
        shadowed = people.stack_with_shadow(stack, offset=5)
        self.assertEqual(shadowed.size, (45, 25))


if __name__ == "__main__":
    unittest.main()
