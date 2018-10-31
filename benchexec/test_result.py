# BenchExec is a framework for reliable benchmarking.
# This file is part of BenchExec.
#
# Copyright (C) 2007-2015  Dirk Beyer
# All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# prepare for Python 3
from __future__ import absolute_import, division, print_function, unicode_literals

import logging
import sys
import unittest
sys.dont_write_bytecode = True # prevent creation of .pyc files

from benchexec.result import *  # @UnusedWildImport
from benchexec.result import _PROP_CALL, _PROP_DEREF, _PROP_FREE, _PROP_MEMTRACK, _PROP_MEMCLEANUP,\
    _PROP_TERMINATION, _PROP_SAT, _SCORE_CORRECT_FALSE, _SCORE_CORRECT_TRUE,\
    _SCORE_WRONG_TRUE, _SCORE_WRONG_FALSE, _PROP_OVERFLOW, _PROP_DEADLOCK, _PROP_MEMSAFETY,\
    Property


class TestResult(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.longMessage = True
        logging.disable(logging.CRITICAL)

    def test_satisfies_file_property_basic(self):
        self.assertEqual(True,  satisfies_file_property('test_true-unreach-call.c',
                                                        [_PROP_CALL]))
        self.assertEqual(False, satisfies_file_property('test_false-unreach-call.c',
                                                        [_PROP_CALL]))
        self.assertEqual(True,  satisfies_file_property('test_true-valid-memsafety.c',
                                                        [_PROP_DEREF, _PROP_FREE, _PROP_MEMTRACK]))
        self.assertEqual(False, satisfies_file_property('test_false-valid-deref.c',
                                                        [_PROP_DEREF, _PROP_FREE, _PROP_MEMTRACK]))
        self.assertEqual(False, satisfies_file_property('test_false-valid-free.c',
                                                        [_PROP_DEREF, _PROP_FREE, _PROP_MEMTRACK]))
        self.assertEqual(False, satisfies_file_property('test_false-valid-memtrack.c',
                                                        [_PROP_DEREF, _PROP_FREE, _PROP_MEMTRACK]))
        self.assertEqual(True, satisfies_file_property('test_true-valid-memcleanup.c',
                                                        [_PROP_MEMCLEANUP]))
        self.assertEqual(False, satisfies_file_property('test_false-valid-memcleanup.c',
                                                        [_PROP_MEMCLEANUP]))
        self.assertEqual(True,  satisfies_file_property('test_true-termination.c',
                                                        [_PROP_TERMINATION]))
        self.assertEqual(False, satisfies_file_property('test_false-termination.c',
                                                        [_PROP_TERMINATION]))
        self.assertEqual(True,  satisfies_file_property('test_sat.smt2',
                                                        [_PROP_SAT]))
        self.assertEqual(False, satisfies_file_property('test_unsat.smt2',
                                                        [_PROP_SAT]))
        self.assertEqual(True,  satisfies_file_property('test_true-no-overflow.c',
                                                        [_PROP_OVERFLOW]))
        self.assertEqual(False, satisfies_file_property('test_false-no-overflow.c',
                                                        [_PROP_OVERFLOW]))
        self.assertEqual(True,  satisfies_file_property('test_true-no-deadlock.c',
                                                        [_PROP_DEADLOCK]))
        self.assertEqual(False, satisfies_file_property('test_false-no-deadlock.c',
                                                        [_PROP_DEADLOCK]))

    def test_satisfies_file_property_multiple_results_in_name(self):
        self.assertEqual(True,  satisfies_file_property('test_false-termination_true-unreach-call_unsat.c',
                                                        [_PROP_CALL]))
        self.assertEqual(False, satisfies_file_property('test_true-termination_false-unreach-call_sat.c',
                                                        [_PROP_CALL]))
        self.assertEqual(True,  satisfies_file_property('test_false-termination_true-valid-memsafety_unsat.c',
                                                        [_PROP_DEREF, _PROP_FREE, _PROP_MEMTRACK]))
        self.assertEqual(True,  satisfies_file_property('test_false-termination_true-valid-memcleanup_unsat.c',
                                                        [_PROP_MEMCLEANUP]))
        self.assertEqual(False, satisfies_file_property('test_true-termination_false-valid-deref_unsat.c',
                                                        [_PROP_DEREF, _PROP_FREE, _PROP_MEMTRACK]))
        self.assertEqual(False, satisfies_file_property('test_true-termination_false-valid-free_unsat.c',
                                                        [_PROP_DEREF, _PROP_FREE, _PROP_MEMTRACK]))
        self.assertEqual(False, satisfies_file_property('test_true-termination_false-valid-memtrack_unsat.c',
                                                        [_PROP_DEREF, _PROP_FREE, _PROP_MEMTRACK]))
        self.assertEqual(True,  satisfies_file_property('test_false-unreach-call_true-termination_unsat.c',
                                                        [_PROP_TERMINATION]))
        self.assertEqual(False, satisfies_file_property('test_true-unreach-call_false-termination_sat.c',
                                                        [_PROP_TERMINATION]))
        self.assertEqual(True,  satisfies_file_property('test_false-unreach-call_sat_false-termination.smt2',
                                                        [_PROP_SAT]))
        self.assertEqual(False, satisfies_file_property('test_true-unreach-call_unsat_true-termination.smt2',
                                                        [_PROP_SAT]))
        self.assertEqual(True,  satisfies_file_property('test_false-unreach-call_true-no-overflow_unsat.c',
                                                        [_PROP_OVERFLOW]))
        self.assertEqual(False, satisfies_file_property('test_true-unreach-call_false-no-overflow_sat.c',
                                                        [_PROP_OVERFLOW]))
        self.assertEqual(True,  satisfies_file_property('test_false-unreach-call_true-no-deadlock_unsat.c',
                                                        [_PROP_DEADLOCK]))
        self.assertEqual(False, satisfies_file_property('test_true-unreach-call_false-no-deadlock_sat.c',
                                                        [_PROP_DEADLOCK]))

    def test_satisfies_file_property_no_property(self):
        self.assertEqual(None,  satisfies_file_property('test_true-unreach-call.c',
                                                        []))
        self.assertEqual(None,  satisfies_file_property('test_true-valid-memsafety.c',
                                                        [_PROP_CALL]))
        self.assertEqual(None,  satisfies_file_property('test_true-termination',
                                                        [_PROP_CALL]))
        self.assertEqual(None,  satisfies_file_property('test_sat',
                                                        [_PROP_CALL]))

        self.assertEqual(None,  satisfies_file_property('test_true-unreach-call.c',
                                                        [_PROP_DEREF, _PROP_FREE, _PROP_MEMTRACK]))
        self.assertEqual(None,  satisfies_file_property('test_true-valid-memsafety.c',
                                                        []))
        self.assertEqual(None,  satisfies_file_property('test_true-termination',
                                                        [_PROP_DEREF, _PROP_FREE, _PROP_MEMTRACK]))
        self.assertEqual(None,  satisfies_file_property('test_sat',
                                                        [_PROP_DEREF, _PROP_FREE, _PROP_MEMTRACK]))

        self.assertEqual(None,  satisfies_file_property('test_true-unreach-call.c',
                                                        [_PROP_TERMINATION]))
        self.assertEqual(None,  satisfies_file_property('test_true-valid-memsafety.c',
                                                        [_PROP_TERMINATION]))
        self.assertEqual(None,  satisfies_file_property('test_true-termination',
                                                        []))
        self.assertEqual(None,  satisfies_file_property('test_sat',
                                                        [_PROP_TERMINATION]))

        self.assertEqual(None,  satisfies_file_property('test_true-unreach-call.c',
                                                        [_PROP_SAT]))
        self.assertEqual(None,  satisfies_file_property('test_true-valid-memsafety.c',
                                                        [_PROP_SAT]))
        self.assertEqual(None,  satisfies_file_property('test_true-termination',
                                                        [_PROP_SAT]))
        self.assertEqual(None,  satisfies_file_property('test_sat',
                                                        []))

        self.assertEqual(None,  satisfies_file_property('test_true-unreach-call.c',
                                                        [_PROP_OVERFLOW]))
        self.assertEqual(None,  satisfies_file_property('test_true-valid-memsafety.c',
                                                        [_PROP_OVERFLOW]))
        self.assertEqual(None,  satisfies_file_property('test_true-termination',
                                                        []))
        self.assertEqual(None,  satisfies_file_property('test_sat',
                                                        [_PROP_OVERFLOW]))

        self.assertEqual(None,  satisfies_file_property('test_true-unreach-call.c',
                                                        [_PROP_DEADLOCK]))
        self.assertEqual(None,  satisfies_file_property('test_true-valid-memsafety.c',
                                                        [_PROP_DEADLOCK]))
        self.assertEqual(None,  satisfies_file_property('test_sat',
                                                        [_PROP_DEADLOCK]))

    def test_satisfies_file_property_multiple_properties(self):
        self.assertEqual(True,  satisfies_file_property('test_true-unreach-call.c',
                                                        [_PROP_CALL, _PROP_TERMINATION]))
        self.assertEqual(None,  satisfies_file_property('test_true-unreach-call.c',
                                                        [_PROP_SAT, _PROP_TERMINATION]))
        self.assertEqual(True,  satisfies_file_property('test_true-no-overflow.c',
                                                        [_PROP_SAT, _PROP_OVERFLOW]))
        self.assertEqual(True,  satisfies_file_property('test_true-no-deadlock.c',
                                                        [_PROP_SAT, _PROP_DEADLOCK]))


    def test_score_for_task_no_score_available(self):
        self.assertEqual(0, score_for_task([_PROP_CALL], CATEGORY_MISSING, RESULT_TRUE_PROP))
        self.assertEqual(0, score_for_task([_PROP_CALL], CATEGORY_ERROR, RESULT_TRUE_PROP))
        self.assertEqual(0, score_for_task([_PROP_CALL], CATEGORY_UNKNOWN, RESULT_TRUE_PROP))

    def test_score_for_task_smt(self):
        self.assertEqual(0, score_for_task([_PROP_SAT], CATEGORY_CORRECT, RESULT_SAT))
        self.assertEqual(0, score_for_task([_PROP_SAT], CATEGORY_WRONG, RESULT_SAT))

    def test_score_for_task_svcomp(self):
        self.assertEqual(_SCORE_CORRECT_TRUE,
                         score_for_task([_PROP_CALL], CATEGORY_CORRECT, RESULT_TRUE_PROP))
        self.assertEqual(_SCORE_CORRECT_FALSE,
                         score_for_task([_PROP_CALL], CATEGORY_CORRECT, RESULT_FALSE_REACH))
        self.assertEqual(_SCORE_CORRECT_TRUE,
                         score_for_task([_PROP_DEREF, _PROP_FREE, _PROP_MEMTRACK], CATEGORY_CORRECT, RESULT_TRUE_PROP))
        self.assertEqual(_SCORE_CORRECT_FALSE,
                         score_for_task([_PROP_DEREF, _PROP_FREE, _PROP_MEMTRACK], CATEGORY_CORRECT, RESULT_FALSE_MEMTRACK))
        self.assertEqual(_SCORE_CORRECT_TRUE,
                         score_for_task([_PROP_TERMINATION], CATEGORY_CORRECT, RESULT_TRUE_PROP))
        self.assertEqual(_SCORE_CORRECT_FALSE,
                         score_for_task([_PROP_TERMINATION], CATEGORY_CORRECT, RESULT_FALSE_TERMINATION))
        self.assertEqual(_SCORE_CORRECT_TRUE,
                         score_for_task([_PROP_OVERFLOW], CATEGORY_CORRECT, RESULT_TRUE_PROP))
        self.assertEqual(_SCORE_CORRECT_FALSE,
                         score_for_task([_PROP_OVERFLOW], CATEGORY_CORRECT, RESULT_FALSE_OVERFLOW))
        self.assertEqual(_SCORE_CORRECT_TRUE,
                         score_for_task([_PROP_DEADLOCK], CATEGORY_CORRECT, RESULT_TRUE_PROP))
        self.assertEqual(_SCORE_CORRECT_FALSE,
                         score_for_task([_PROP_DEADLOCK], CATEGORY_CORRECT, RESULT_FALSE_DEADLOCK))

        self.assertEqual(_SCORE_WRONG_FALSE,
                         score_for_task([_PROP_CALL], CATEGORY_WRONG, RESULT_FALSE_REACH))
        self.assertEqual(_SCORE_WRONG_TRUE,
                         score_for_task([_PROP_CALL], CATEGORY_WRONG, RESULT_TRUE_PROP))
        self.assertEqual(_SCORE_WRONG_FALSE,
                         score_for_task([_PROP_DEREF, _PROP_FREE, _PROP_MEMTRACK], CATEGORY_WRONG, RESULT_FALSE_MEMTRACK))
        self.assertEqual(_SCORE_WRONG_TRUE,
                         score_for_task([_PROP_DEREF, _PROP_FREE, _PROP_MEMTRACK], CATEGORY_WRONG, RESULT_TRUE_PROP))
        self.assertEqual(_SCORE_WRONG_FALSE,
                         score_for_task([_PROP_DEREF, _PROP_FREE, _PROP_MEMTRACK], CATEGORY_WRONG, RESULT_FALSE_DEREF))
        self.assertEqual(_SCORE_WRONG_FALSE,
                         score_for_task([_PROP_TERMINATION], CATEGORY_WRONG, RESULT_FALSE_TERMINATION))
        self.assertEqual(_SCORE_WRONG_TRUE,
                         score_for_task([_PROP_TERMINATION], CATEGORY_WRONG, RESULT_TRUE_PROP))
        self.assertEqual(_SCORE_WRONG_FALSE,
                         score_for_task([_PROP_OVERFLOW], CATEGORY_WRONG, RESULT_FALSE_OVERFLOW))
        self.assertEqual(_SCORE_WRONG_TRUE,
                         score_for_task([_PROP_OVERFLOW], CATEGORY_WRONG, RESULT_TRUE_PROP))
        self.assertEqual(_SCORE_WRONG_FALSE,
                         score_for_task([_PROP_DEADLOCK], CATEGORY_WRONG, RESULT_FALSE_OVERFLOW))
        self.assertEqual(_SCORE_WRONG_TRUE,
                         score_for_task([_PROP_DEADLOCK], CATEGORY_WRONG, RESULT_TRUE_PROP))


    def test_result_classification(self):
        self.assertEqual(RESULT_CLASS_TRUE, get_result_classification(RESULT_TRUE_PROP))
        self.assertEqual(RESULT_CLASS_TRUE, get_result_classification(RESULT_SAT))

        self.assertEqual(RESULT_CLASS_FALSE, get_result_classification(RESULT_FALSE_REACH))
        self.assertEqual(RESULT_CLASS_FALSE, get_result_classification(RESULT_FALSE_DEREF))
        self.assertEqual(RESULT_CLASS_FALSE, get_result_classification(RESULT_FALSE_FREE))
        self.assertEqual(RESULT_CLASS_FALSE, get_result_classification(RESULT_FALSE_MEMTRACK))
        self.assertEqual(RESULT_CLASS_FALSE, get_result_classification(RESULT_FALSE_TERMINATION))
        self.assertEqual(RESULT_CLASS_FALSE, get_result_classification(RESULT_UNSAT))
        self.assertEqual(RESULT_CLASS_FALSE, get_result_classification(RESULT_WITNESS_CONFIRMED))
        self.assertEqual(RESULT_CLASS_FALSE, get_result_classification(RESULT_FALSE_OVERFLOW))

        self.assertEqual(RESULT_CLASS_UNKNOWN, get_result_classification(RESULT_UNKNOWN))

        self.assertEqual(RESULT_CLASS_ERROR, get_result_classification('KILLED'))
        self.assertEqual(RESULT_CLASS_ERROR, get_result_classification('TIMEOUT'))
        self.assertEqual(RESULT_CLASS_ERROR, get_result_classification(''))

    def expected_result(self, result, subcategory=None):
        return {'dummy.prp': ExpectedResult(result, subcategory)}

    prop_call = Property("dummy.prp", True, True, _PROP_CALL, [])
    prop_deadlock = Property("dummy.prp", True, True, _PROP_DEADLOCK, [])
    prop_memcleanup = Property("dummy.prp", True, True, _PROP_MEMCLEANUP, [])
    prop_memsafety = Property("dummy.prp", True, True, _PROP_MEMSAFETY, [_PROP_DEREF, _PROP_FREE, _PROP_MEMTRACK])
    prop_overflow = Property("dummy.prp", True, True, _PROP_OVERFLOW, [])
    prop_termination = Property("dummy.prp", True, True, _PROP_TERMINATION, [])
    prop_sat = Property("dummy.prp", True, False, _PROP_SAT, [])

    def test_result_category_true(self):
        self.assertEqual(CATEGORY_CORRECT,
                         get_result_category(self.expected_result(True),  RESULT_TRUE_PROP, [self.prop_call]))
        self.assertEqual(CATEGORY_WRONG,
                         get_result_category(self.expected_result(False), RESULT_TRUE_PROP, [self.prop_call]))
        self.assertEqual(CATEGORY_CORRECT,
                         get_result_category(self.expected_result(True), RESULT_TRUE_PROP, [self.prop_memsafety]))
        self.assertEqual(CATEGORY_WRONG,
                         get_result_category(self.expected_result(False, 'valid-memtrack'), RESULT_TRUE_PROP, [self.prop_memsafety]))
        self.assertEqual(CATEGORY_CORRECT,
                         get_result_category(self.expected_result(True),  RESULT_TRUE_PROP, [self.prop_memcleanup]))
        self.assertEqual(CATEGORY_WRONG,
                         get_result_category(self.expected_result(False), RESULT_TRUE_PROP, [self.prop_memcleanup]))
        self.assertEqual(CATEGORY_CORRECT,
                         get_result_category(self.expected_result(True),  RESULT_TRUE_PROP, [self.prop_termination]))
        self.assertEqual(CATEGORY_WRONG,
                         get_result_category(self.expected_result(False), RESULT_TRUE_PROP, [self.prop_termination]))
        self.assertEqual(CATEGORY_CORRECT,
                         get_result_category(self.expected_result(True),  RESULT_SAT, [self.prop_sat]))
        self.assertEqual(CATEGORY_WRONG,
                         get_result_category(self.expected_result(False), RESULT_SAT, [self.prop_sat]))
        self.assertEqual(CATEGORY_CORRECT,
                         get_result_category(self.expected_result(True),  RESULT_TRUE_PROP, [self.prop_overflow]))
        self.assertEqual(CATEGORY_WRONG,
                         get_result_category(self.expected_result(False), RESULT_TRUE_PROP, [self.prop_overflow]))
        self.assertEqual(CATEGORY_CORRECT,
                         get_result_category(self.expected_result(True),  RESULT_TRUE_PROP, [self.prop_deadlock]))
        self.assertEqual(CATEGORY_WRONG,
                         get_result_category(self.expected_result(False), RESULT_TRUE_PROP, [self.prop_deadlock]))

    def test_result_category_false(self):
        self.assertEqual(CATEGORY_WRONG,
                         get_result_category(self.expected_result(True),  RESULT_FALSE_REACH, [self.prop_call]))
        self.assertEqual(CATEGORY_CORRECT,
                         get_result_category(self.expected_result(False), RESULT_FALSE_REACH, [self.prop_call]))
        self.assertEqual(CATEGORY_WRONG,
                         get_result_category(self.expected_result(True),  RESULT_FALSE_DEREF, [self.prop_memsafety]))
        self.assertEqual(CATEGORY_WRONG,
                         get_result_category(self.expected_result(True),  RESULT_FALSE_FREE, [self.prop_memsafety]))
        self.assertEqual(CATEGORY_WRONG,
                         get_result_category(self.expected_result(True),  RESULT_FALSE_MEMTRACK, [self.prop_memsafety]))
        self.assertEqual(CATEGORY_CORRECT,
                         get_result_category(self.expected_result(False, 'valid-deref'),    RESULT_FALSE_DEREF, [self.prop_memsafety]))
        self.assertEqual(CATEGORY_CORRECT,
                         get_result_category(self.expected_result(False, 'valid-free'),     RESULT_FALSE_FREE, [self.prop_memsafety]))
        self.assertEqual(CATEGORY_CORRECT,
                         get_result_category(self.expected_result(False, 'valid-memtrack'), RESULT_FALSE_MEMTRACK, [self.prop_memsafety]))
        self.assertEqual(CATEGORY_WRONG,
                         get_result_category(self.expected_result(False, 'valid-deref'),    RESULT_FALSE_FREE, [self.prop_memsafety]))
        self.assertEqual(CATEGORY_WRONG,
                         get_result_category(self.expected_result(False, 'valid-free'),     RESULT_FALSE_MEMTRACK, [self.prop_memsafety]))
        self.assertEqual(CATEGORY_WRONG,
                         get_result_category(self.expected_result(False, 'valid-memtrack'), RESULT_FALSE_DEREF, [self.prop_memsafety]))
        self.assertEqual(CATEGORY_WRONG,
                         get_result_category(self.expected_result(True),  RESULT_FALSE_TERMINATION, [self.prop_termination]))
        self.assertEqual(CATEGORY_CORRECT,
                         get_result_category(self.expected_result(False), RESULT_FALSE_TERMINATION, [self.prop_termination]))
        self.assertEqual(CATEGORY_WRONG,
                         get_result_category(self.expected_result(True),  RESULT_UNSAT, [self.prop_sat]))
        self.assertEqual(CATEGORY_CORRECT,
                         get_result_category(self.expected_result(False), RESULT_UNSAT, [self.prop_sat]))
        self.assertEqual(CATEGORY_WRONG,
                         get_result_category(self.expected_result(True),  RESULT_FALSE_OVERFLOW, [self.prop_overflow]))
        self.assertEqual(CATEGORY_CORRECT,
                         get_result_category(self.expected_result(False), RESULT_FALSE_OVERFLOW, [self.prop_overflow]))
        self.assertEqual(CATEGORY_WRONG,
                         get_result_category(self.expected_result(True),  RESULT_FALSE_DEADLOCK, [self.prop_deadlock]))
        self.assertEqual(CATEGORY_CORRECT,
                         get_result_category(self.expected_result(False), RESULT_FALSE_DEADLOCK, [self.prop_deadlock]))

    def test_result_category_different_false_result(self):
        expected_result_false = self.expected_result(False)
        self.assertEqual(CATEGORY_UNKNOWN,
                         get_result_category(expected_result_false, RESULT_FALSE_DEREF, [self.prop_call]))
        self.assertEqual(CATEGORY_UNKNOWN,
                         get_result_category(expected_result_false, RESULT_FALSE_TERMINATION, [self.prop_call]))
        self.assertEqual(CATEGORY_UNKNOWN,
                         get_result_category(expected_result_false, RESULT_UNSAT, [self.prop_call]))
        self.assertEqual(CATEGORY_UNKNOWN,
                         get_result_category(expected_result_false, RESULT_FALSE_OVERFLOW, [self.prop_call]))

        self.assertEqual(CATEGORY_UNKNOWN,
                         get_result_category(expected_result_false, RESULT_FALSE_REACH, [self.prop_termination]))
        self.assertEqual(CATEGORY_UNKNOWN,
                         get_result_category(expected_result_false, RESULT_FALSE_DEREF, [self.prop_termination]))
        self.assertEqual(CATEGORY_UNKNOWN,
                         get_result_category(expected_result_false, RESULT_UNSAT, [self.prop_termination]))
        self.assertEqual(CATEGORY_UNKNOWN,
                         get_result_category(expected_result_false, RESULT_FALSE_OVERFLOW, [self.prop_termination]))

        self.assertEqual(CATEGORY_UNKNOWN,
                         get_result_category(expected_result_false, RESULT_FALSE_REACH, [self.prop_sat]))
        self.assertEqual(CATEGORY_UNKNOWN,
                         get_result_category(expected_result_false, RESULT_FALSE_DEREF, [self.prop_sat]))
        self.assertEqual(CATEGORY_UNKNOWN,
                         get_result_category(expected_result_false, RESULT_FALSE_TERMINATION, [self.prop_sat]))
        self.assertEqual(CATEGORY_UNKNOWN,
                         get_result_category(expected_result_false, RESULT_FALSE_OVERFLOW, [self.prop_sat]))

        self.assertEqual(CATEGORY_UNKNOWN,
                         get_result_category(expected_result_false, RESULT_FALSE_REACH, [self.prop_overflow]))
        self.assertEqual(CATEGORY_UNKNOWN,
                         get_result_category(expected_result_false, RESULT_FALSE_DEREF, [self.prop_overflow]))
        self.assertEqual(CATEGORY_UNKNOWN,
                         get_result_category(expected_result_false, RESULT_FALSE_TERMINATION, [self.prop_overflow]))
        self.assertEqual(CATEGORY_UNKNOWN,
                         get_result_category(expected_result_false, RESULT_UNSAT, [self.prop_overflow]))

        self.assertEqual(CATEGORY_UNKNOWN,
                         get_result_category(expected_result_false, RESULT_FALSE_REACH, [self.prop_deadlock]))
        self.assertEqual(CATEGORY_UNKNOWN,
                         get_result_category(expected_result_false, RESULT_FALSE_DEREF, [self.prop_deadlock]))
        self.assertEqual(CATEGORY_UNKNOWN,
                         get_result_category(expected_result_false, RESULT_FALSE_TERMINATION, [self.prop_deadlock]))
        self.assertEqual(CATEGORY_UNKNOWN,
                         get_result_category(expected_result_false, RESULT_UNSAT, [self.prop_deadlock]))

    def test_result_category_different_true_result(self):
        expected_result_true = self.expected_result(True)
        self.assertEqual(CATEGORY_UNKNOWN,
                         get_result_category(expected_result_true, RESULT_SAT, [self.prop_call]))
        self.assertEqual(CATEGORY_UNKNOWN,
                         get_result_category(expected_result_true, RESULT_TRUE_PROP, [self.prop_sat]))

    def test_result_category_no_property(self):
        self.assertEqual(CATEGORY_MISSING,
                         get_result_category(self.expected_result(True),  RESULT_TRUE_PROP, []))
        self.assertEqual(CATEGORY_MISSING,
                         get_result_category(self.expected_result(False), RESULT_TRUE_PROP, []))
        self.assertEqual(CATEGORY_MISSING,
                         get_result_category(self.expected_result(True),  RESULT_TRUE_PROP, []))
        self.assertEqual(CATEGORY_MISSING,
                         get_result_category(self.expected_result(False, 'valid-memtrack.c'), RESULT_TRUE_PROP, []))
        self.assertEqual(CATEGORY_MISSING,
                         get_result_category(self.expected_result(True),  RESULT_TRUE_PROP, []))
        self.assertEqual(CATEGORY_MISSING,
                         get_result_category(self.expected_result(False), RESULT_TRUE_PROP, []))
        self.assertEqual(CATEGORY_MISSING,
                         get_result_category(self.expected_result(True),  RESULT_SAT, []))
        self.assertEqual(CATEGORY_MISSING,
                         get_result_category(self.expected_result(False), RESULT_SAT, []))
        self.assertEqual(CATEGORY_MISSING,
                         get_result_category(self.expected_result(True),  RESULT_TRUE_PROP, []))
        self.assertEqual(CATEGORY_MISSING,
                         get_result_category(self.expected_result(False), RESULT_TRUE_PROP, []))

    def test_result_category_different_property(self):
        def other_expected_result(result, subcategory=None):
            return {'different-file.prp': ExpectedResult(result, subcategory)}

        self.assertEqual(CATEGORY_MISSING,
                         get_result_category(other_expected_result(True),  RESULT_TRUE_PROP, [self.prop_termination]))
        self.assertEqual(CATEGORY_MISSING,
                         get_result_category(other_expected_result(False), RESULT_TRUE_PROP, [self.prop_termination]))
        self.assertEqual(CATEGORY_MISSING,
                         get_result_category(other_expected_result(True),  RESULT_TRUE_PROP, [self.prop_call]))
        self.assertEqual(CATEGORY_MISSING,
                         get_result_category(other_expected_result(False, 'valid-memtrack'), RESULT_TRUE_PROP, [self.prop_call]))
        self.assertEqual(CATEGORY_MISSING,
                         get_result_category(other_expected_result(True),  RESULT_TRUE_PROP, [self.prop_call]))
        self.assertEqual(CATEGORY_MISSING,
                         get_result_category(other_expected_result(False), RESULT_TRUE_PROP, [self.prop_call]))
        self.assertEqual(CATEGORY_MISSING,
                         get_result_category(other_expected_result(True),  RESULT_SAT, [self.prop_call]))
        self.assertEqual(CATEGORY_MISSING,
                         get_result_category(other_expected_result(False), RESULT_SAT, [self.prop_call]))

    def test_result_category_other(self):
        self.assertEqual(CATEGORY_UNKNOWN,
                         get_result_category(self.expected_result(True), RESULT_UNKNOWN, [self.prop_call]))
        self.assertEqual(CATEGORY_ERROR,
                         get_result_category(self.expected_result(True), 'KILLED', [self.prop_call]))
        self.assertEqual(CATEGORY_ERROR,
                         get_result_category(self.expected_result(True), 'TIMEOUT', [self.prop_call]))
        self.assertEqual(CATEGORY_ERROR,
                         get_result_category(self.expected_result(True), '', [self.prop_call]))
