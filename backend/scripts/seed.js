const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Problem = require('../src/models/Problem');

// Load env vars
dotenv.config();

const sampleProblems = [
  {
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, write a function two_sum(nums, target) that returns indices of the two numbers such that they add up to target. Return as a list of two integers. Assumes exactly one solution.',
    difficulty: 'easy',
    concept_tags: ['arrays', 'hash map'],
    prerequisite_tags: [],           // no prerequisites — entry-level problem
    languages_supported: ['python'],
    complexity_expected: 'O(n)',
    input_generator: `
def print_input(n):
    import random
    nums = [random.randint(-1000, 1000) for _ in range(n)]
    target = nums[0] + nums[1]
    print(f"print(two_sum({nums}, {target}))")
`,
    test_cases: [
      { input: 'print(two_sum([2, 7, 11, 15], 9))',  expected_output: '[0, 1]' },
      { input: 'print(two_sum([3, 2, 4], 6))',        expected_output: '[1, 2]' }
    ],
    hidden_test_cases: [
      { input: 'print(two_sum([3, 3], 6))',           expected_output: '[0, 1]' },
      { input: 'print(two_sum([1, 2, 3, 4, 5], 9))', expected_output: '[3, 4]' }
    ]
  },
  {
    title: 'Reverse String',
    description: 'Write a function reverse_string(s) that reverses a string and returns it.',
    difficulty: 'easy',
    concept_tags: ['strings', 'two pointers'],
    prerequisite_tags: [],
    languages_supported: ['python'],
    complexity_expected: 'O(n)',
    input_generator: `
import random, string
def print_input(n):
    s = ''.join(random.choices(string.ascii_lowercase, k=n))
    print(f"print(reverse_string('{s}'))")
`,
    test_cases: [
      { input: 'print(reverse_string("hello"))',      expected_output: 'olleh' },
      { input: 'print(reverse_string("AdaptLearn"))', expected_output: 'nraeLtpadA' }
    ],
    hidden_test_cases: [
      { input: 'print(reverse_string(""))',            expected_output: '' },
      { input: 'print(reverse_string("a"))',           expected_output: 'a' }
    ]
  },
  {
    title: 'Fibonacci Number',
    description: 'The Fibonacci numbers form a sequence where each number is the sum of the two preceding ones, starting from 0 and 1. Write a function fib(n) that returns the nth Fibonacci number.',
    difficulty: 'easy',
    concept_tags: ['math', 'recursion', 'dynamic programming'],
    prerequisite_tags: ['math'],
    languages_supported: ['python'],
    complexity_expected: 'O(n)',
    input_generator: `
def print_input(n):
    # n is used as the fibonacci index here
    print(f"print(fib({n % 30}))")
`,
    test_cases: [
      { input: 'print(fib(2))', expected_output: '1' },
      { input: 'print(fib(4))', expected_output: '3' },
      { input: 'print(fib(7))', expected_output: '13' }
    ],
    hidden_test_cases: [
      { input: 'print(fib(0))',  expected_output: '0' },
      { input: 'print(fib(1))',  expected_output: '1' },
      { input: 'print(fib(10))', expected_output: '55' }
    ]
  },
  {
    title: 'Valid Palindrome',
    description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Write a function is_palindrome(s) returning True or False.',
    difficulty: 'easy',
    concept_tags: ['strings', 'two pointers'],
    prerequisite_tags: ['strings'],
    languages_supported: ['python'],
    complexity_expected: 'O(n)',
    input_generator: '',            // string inputs are hard to auto-generate meaningfully
    test_cases: [
      { input: 'print(is_palindrome("A man, a plan, a canal: Panama"))', expected_output: 'True' },
      { input: 'print(is_palindrome("race a car"))',                      expected_output: 'False' }
    ],
    hidden_test_cases: [
      { input: 'print(is_palindrome(" "))',   expected_output: 'True' },
      { input: 'print(is_palindrome("0P"))',  expected_output: 'False' }
    ]
  },
  {
    title: 'Binary Search',
    description: 'Given a sorted array of integers nums and a target integer, write a function binary_search(nums, target) that searches for target in nums. If target exists, return its index; otherwise, return -1 in O(log n) time.',
    difficulty: 'medium',
    concept_tags: ['arrays', 'binary search'],
    prerequisite_tags: ['arrays'],   // must understand arrays before binary search
    languages_supported: ['python'],
    complexity_expected: 'O(log n)',
    input_generator: `
import random
def print_input(n):
    nums = sorted(random.sample(range(-n*10, n*10), n))
    target = random.choice(nums)
    print(f"print(binary_search({nums}, {target}))")
`,
    test_cases: [
      { input: 'print(binary_search([-1, 0, 3, 5, 9, 12], 9))',  expected_output: '4' },
      { input: 'print(binary_search([-1, 0, 3, 5, 9, 12], 2))',  expected_output: '-1' }
    ],
    hidden_test_cases: [
      { input: 'print(binary_search([1], 1))',                     expected_output: '0' },
      { input: 'print(binary_search([1, 3, 5, 7, 9], 1))',        expected_output: '0' },
      { input: 'print(binary_search([1, 3, 5, 7, 9], 10))',       expected_output: '-1' }
    ]
  },
  {
    title: 'Max Subarray Sum (Kadane)',
    description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum. Write a function max_sub_array(nums).',
    difficulty: 'medium',
    concept_tags: ['arrays', 'dynamic programming'],
    prerequisite_tags: ['arrays'],
    languages_supported: ['python'],
    complexity_expected: 'O(n)',
    input_generator: `
import random
def print_input(n):
    nums = [random.randint(-100, 100) for _ in range(n)]
    print(f"print(max_sub_array({nums}))")
`,
    test_cases: [
      { input: 'print(max_sub_array([-2, 1, -3, 4, -1, 2, 1, -5, 4]))', expected_output: '6' },
      { input: 'print(max_sub_array([1]))',                               expected_output: '1' },
      { input: 'print(max_sub_array([5, 4, -1, 7, 8]))',                 expected_output: '23' }
    ],
    hidden_test_cases: [
      { input: 'print(max_sub_array([-1]))',                              expected_output: '-1' },
      { input: 'print(max_sub_array([-2, -1]))',                         expected_output: '-1' }
    ]
  },
  {
    title: 'Longest Palindromic Substring',
    description: 'Given a string s, return the longest palindromic substring in s. Write a function longest_palindrome(s).',
    difficulty: 'hard',
    concept_tags: ['strings', 'dynamic programming', 'two pointers'],
    prerequisite_tags: ['strings', 'dynamic programming'],  // requires both
    languages_supported: ['python'],
    complexity_expected: 'O(n²)',
    input_generator: '',
    test_cases: [
      { input: 'print(longest_palindrome("babad") in ["bab", "aba"])', expected_output: 'True' },
      { input: 'print(longest_palindrome("cbbd"))',                     expected_output: 'bb' }
    ],
    hidden_test_cases: [
      { input: 'print(longest_palindrome("a"))',                        expected_output: 'a' },
      { input: 'print(longest_palindrome("ac"))',                       expected_output: 'a' }
    ]
  }
];

const seedDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    await Problem.deleteMany();
    console.log('Previous problems removed');

    await Problem.insertMany(sampleProblems);
    console.log('Sample problems inserted!');

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDB();
