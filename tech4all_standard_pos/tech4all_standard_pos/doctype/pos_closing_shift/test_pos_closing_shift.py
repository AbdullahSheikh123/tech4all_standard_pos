# -*- coding: utf-8 -*-
# See license.txt
from __future__ import unicode_literals

import unittest
from unittest.mock import patch

from tech4all_standard_pos.tech4all_standard_pos.doctype.pos_closing_shift.pos_closing_shift import (
	get_cashiers,
)

class TestPOSClosingShift(unittest.TestCase):
	@patch(
		"tech4all_standard_pos.tech4all_standard_pos.doctype.pos_closing_shift."
		"pos_closing_shift.frappe.get_all"
	)
	def test_get_cashiers_returns_link_query_rows(self, get_all):
		get_all.return_value = [
			{"user": "cashier@example.com"},
			{"user": "manager@example.com"},
		]

		result = get_cashiers(
			"User",
			"",
			"name",
			0,
			20,
			{"parent": "Demo PP"},
		)

		self.assertEqual(
			result,
			[["cashier@example.com"], ["manager@example.com"]],
		)
		get_all.assert_called_once_with(
			"POS Profile User",
			filters={"parent": "Demo PP"},
			fields=["user"],
		)
