/**
 * Production-Level Combined QR Code Parser
 * Handles multiple QR code formats for part number + order number combinations
 * 
 * Supported Formats:
 * 1. ORDER/PART (slash separator)
 * 2. ORDER-PART (dash separator) with smart length detection
 * 3. Complex formats with multiple dashes
 */

export interface ParsedQRCode {
  orderNumber: string;
  partNumber: string;
  format: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface QRCodePattern {
  name: string;
  regex: RegExp;
  parse: (text: string) => { orderNumber: string; partNumber: string } | null;
  priority: number; // Lower number = higher priority
  description: string;
}

/**
 * QR Code Format Patterns (ordered by priority)
 */
export const QR_PATTERNS: QRCodePattern[] = [
  {
    name: 'slash-separator',
    regex: /^(\d{1,10})\/(\d{1,10})$/,
    priority: 1,
    description: 'Order/Part separated by slash (e.g., 12345/678)',
    parse: (text: string) => {
      const match = text.match(/^(\d{1,10})\/(\d{1,10})$/);
      if (!match) return null;
      return {
        orderNumber: match[1],
        partNumber: match[2]
      };
    }
  },
  {
    name: 'complex-order-slash',
    regex: /^(\d{1,10}-\d{1,10})\/(\d{1,10})$/,
    priority: 2,
    description: 'Complex order (with dash) and part separated by slash (e.g., 12345-123/1234)',
    parse: (text: string) => {
      const match = text.match(/^(\d{1,10}-\d{1,10})\/(\d{1,10})$/);
      if (!match) return null;
      return {
        orderNumber: match[1], // e.g., "12345-123"
        partNumber: match[2]    // e.g., "1234"
      };
    }
  },
  {
    name: 'multiple-dash-complex',
    regex: /^(\d{1,10})-(\d{1,10})-(\d{1,10})$/,
    priority: 3,
    description: 'Three segments separated by dashes (e.g., 12345-678-9012)',
    parse: (text: string) => {
      const match = text.match(/^(\d{1,10})-(\d{1,10})-(\d{1,10})$/);
      if (!match) return null;
      // First segment = order number
      // Combine second and third = part number (or vice versa based on context)
      // We'll use length heuristics
      const seg1 = match[1];
      const seg2 = match[2];
      const seg3 = match[3];
      
      // If first segment is longest, it's likely the order
      if (seg1.length >= seg2.length && seg1.length >= seg3.length) {
        return {
          orderNumber: seg1,
          partNumber: `${seg2}-${seg3}`
        };
      }
      // If last segment is longest, it's likely the part
      if (seg3.length >= seg1.length && seg3.length >= seg2.length) {
        return {
          orderNumber: `${seg1}-${seg2}`,
          partNumber: seg3
        };
      }
      // Default: first as order, rest as part
      return {
        orderNumber: seg1,
        partNumber: `${seg2}-${seg3}`
      };
    }
  },
  {
    name: 'dash-separator-smart',
    regex: /^(\d{1,10})-(\d{1,10})$/,
    priority: 4,
    description: 'Order-Part separated by dash with smart length detection',
    parse: (text: string) => {
      const match = text.match(/^(\d{1,10})-(\d{1,10})$/);
      if (!match) return null;
      
      const part1 = match[1];
      const part2 = match[2];
      
      // Smart detection based on typical patterns:
      // - Part numbers are often 3-6 digits
      // - Order numbers are often 4-8 digits
      // - If one part is significantly longer, it's likely the order
      
      const len1 = part1.length;
      const len2 = part2.length;
      
      // If first part is much longer (2+ digits difference), it's likely order-part
      if (len1 >= len2 + 2) {
        return {
          orderNumber: part1,
          partNumber: part2
        };
      }
      
      // If second part is much longer (2+ digits difference), it's likely part-order (reversed)
      if (len2 >= len1 + 2) {
        return {
          orderNumber: part2,
          partNumber: part1
        };
      }
      
      // If both are similar length, use convention:
      // - Shorter number (3-4 digits) = part
      // - Longer number (5+ digits) = order
      if (len1 <= 4 && len2 >= 5) {
        return {
          orderNumber: part2,
          partNumber: part1
        };
      }
      
      // Default assumption: ORDER-PART (left to right)
      return {
        orderNumber: part1,
        partNumber: part2
      };
    }
  }
];

/**
 * Main parsing function with confidence scoring
 */
export function parseCombinedQRCode(text: string): ParsedQRCode | null {
  if (!text || typeof text !== 'string') {
    return null;
  }

  const trimmed = text.trim();
  
  // Try each pattern in priority order
  for (const pattern of QR_PATTERNS.sort((a, b) => a.priority - b.priority)) {
    if (pattern.regex.test(trimmed)) {
      const result = pattern.parse(trimmed);
      if (result) {
        // Determine confidence based on pattern type
        let confidence: 'high' | 'medium' | 'low' = 'high';
        
        if (pattern.name === 'dash-separator-smart' || pattern.name === 'multiple-dash-complex') {
          // These use heuristics, so medium confidence
          confidence = 'medium';
        }
        
        return {
          ...result,
          format: pattern.name,
          confidence
        };
      }
    }
  }
  
  return null;
}

/**
 * Test cases for validation
 */
export const TEST_CASES = [
  // Slash separator (highest confidence)
  { input: '12345/678', expected: { orderNumber: '12345', partNumber: '678' }, format: 'slash-separator' },
  { input: '1000/1', expected: { orderNumber: '1000', partNumber: '1' }, format: 'slash-separator' },
  { input: '99999/12345', expected: { orderNumber: '99999', partNumber: '12345' }, format: 'slash-separator' },
  
  // Complex order with slash
  { input: '12345-123/1234', expected: { orderNumber: '12345-123', partNumber: '1234' }, format: 'complex-order-slash' },
  { input: '5000-1/999', expected: { orderNumber: '5000-1', partNumber: '999' }, format: 'complex-order-slash' },
  
  // Dash separator (smart detection)
  { input: '12345-678', expected: { orderNumber: '12345', partNumber: '678' }, format: 'dash-separator-smart' },
  { input: '1234-12345', expected: { orderNumber: '12345', partNumber: '1234' }, format: 'dash-separator-smart' }, // Reversed (part-order)
  { input: '123-5678', expected: { orderNumber: '5678', partNumber: '123' }, format: 'dash-separator-smart' },
  
  // Multiple dashes
  { input: '12345-678-901', expected: { orderNumber: '12345', partNumber: '678-901' }, format: 'multiple-dash-complex' },
  
  // Edge cases that should NOT match
  { input: 'ABC123', expected: null, format: null },
  { input: '12345', expected: null, format: null },
  { input: '12345-', expected: null, format: null },
  { input: '/12345', expected: null, format: null },
];

/**
 * Run tests and return results
 */
export function runTests(): { passed: number; failed: number; results: any[] } {
  const results = TEST_CASES.map(testCase => {
    const result = parseCombinedQRCode(testCase.input);
    const passed = testCase.expected === null 
      ? result === null
      : result !== null && 
        result.orderNumber === testCase.expected.orderNumber &&
        result.partNumber === testCase.expected.partNumber;
    
    return {
      input: testCase.input,
      expected: testCase.expected,
      actual: result,
      passed,
      message: passed ? 'PASS' : `FAIL: Expected ${JSON.stringify(testCase.expected)}, got ${JSON.stringify(result)}`
    };
  });
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  return { passed, failed, results };
}

/**
 * Validate a parsed result
 */
export function validateParsedResult(parsed: ParsedQRCode | null): boolean {
  if (!parsed) return false;
  
  return (
    parsed.orderNumber?.length > 0 &&
    parsed.partNumber?.length > 0 &&
    /^\d+(-\d+)*$/.test(parsed.orderNumber) && // Allow dashes in order numbers
    /^\d+(-\d+)*$/.test(parsed.partNumber)     // Allow dashes in part numbers
  );
}
