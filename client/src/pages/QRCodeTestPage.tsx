import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppHeader } from "@/components/AppHeader";
import { parseCombinedQRCode, validateParsedResult, TEST_CASES, runTests, QR_PATTERNS } from "@/lib/qr-code-parser";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function QRCodeTestPage() {
  const [testInput, setTestInput] = useState("");
  const [testResults, setTestResults] = useState<any>(null);
  const [allTestsRun, setAllTestsRun] = useState(false);

  const handleTestInput = () => {
    const result = parseCombinedQRCode(testInput);
    const isValid = validateParsedResult(result);
    setTestResults({
      input: testInput,
      result,
      isValid
    });
  };

  const handleRunAllTests = () => {
    const results = runTests();
    setAllTestsRun(true);
    console.log('QR Code Test Results:', results);
  };

  const testRunResults = allTestsRun ? runTests() : null;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Combined QR Code Parser Test</h1>
            <p className="text-muted-foreground">Test different QR code formats for Part Number + Order Number</p>
          </div>
        </div>

        {/* Supported Formats */}
        <Card>
          <CardHeader>
            <CardTitle>Supported QR Code Formats</CardTitle>
            <CardDescription>All recognized patterns with examples and descriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Priority</TableHead>
                  <TableHead>Format Name</TableHead>
                  <TableHead>Pattern</TableHead>
                  <TableHead>Example</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {QR_PATTERNS.map((pattern, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{pattern.priority}</TableCell>
                    <TableCell className="font-mono text-sm">{pattern.name}</TableCell>
                    <TableCell className="font-mono text-xs">{pattern.regex.toString()}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {pattern.name === 'slash-separator' && '12345/678'}
                      {pattern.name === 'complex-order-slash' && '12345-123/1234'}
                      {pattern.name === 'multiple-dash-complex' && '12345-678-901'}
                      {pattern.name === 'dash-separator-smart' && '12345-678'}
                    </TableCell>
                    <TableCell className="text-sm">{pattern.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Interactive Test */}
        <Card>
          <CardHeader>
            <CardTitle>Test Your QR Code</CardTitle>
            <CardDescription>Enter a QR code value to test parsing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Enter QR code (e.g., 12345/678)" 
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="font-mono"
                data-testid="input-qr-test"
              />
              <Button 
                onClick={handleTestInput}
                data-testid="button-test-qr"
              >
                Test
              </Button>
            </div>

            {testResults && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Input:</span>
                  <code className="bg-background px-2 py-1 rounded">{testResults.input}</code>
                </div>
                
                {testResults.result ? (
                  <>
                    <div className="flex items-center gap-2">
                      {testResults.isValid ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                      )}
                      <span className="font-semibold">Status:</span>
                      <Badge variant={testResults.isValid ? "default" : "secondary"}>
                        {testResults.isValid ? 'Valid' : 'Invalid Format'}
                      </Badge>
                    </div>

                    {testResults.isValid && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Format:</span>
                          <Badge variant="outline">{testResults.result.format}</Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Confidence:</span>
                          <Badge 
                            variant={
                              testResults.result.confidence === 'high' ? 'default' : 
                              testResults.result.confidence === 'medium' ? 'secondary' : 
                              'destructive'
                            }
                          >
                            {testResults.result.confidence}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="space-y-1">
                            <span className="text-sm text-muted-foreground">Order Number</span>
                            <div className="bg-green-100 dark:bg-green-900/20 px-3 py-2 rounded font-mono text-lg font-bold">
                              {testResults.result.orderNumber}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-sm text-muted-foreground">Part Number</span>
                            <div className="bg-blue-100 dark:bg-blue-900/20 px-3 py-2 rounded font-mono text-lg font-bold">
                              {testResults.result.partNumber}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="w-5 h-5" />
                    <span className="font-semibold">No match found - not a recognized combined QR code format</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Automated Test Suite */}
        <Card>
          <CardHeader>
            <CardTitle>Automated Test Suite</CardTitle>
            <CardDescription>Run comprehensive tests against all supported formats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleRunAllTests}
              data-testid="button-run-all-tests"
              variant="outline"
            >
              Run All Tests
            </Button>

            {testRunResults && (
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  <Badge variant="default" className="text-lg px-4 py-2">
                    ✓ {testRunResults.passed} Passed
                  </Badge>
                  {testRunResults.failed > 0 && (
                    <Badge variant="destructive" className="text-lg px-4 py-2">
                      ✗ {testRunResults.failed} Failed
                    </Badge>
                  )}
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Status</TableHead>
                      <TableHead>Input</TableHead>
                      <TableHead>Expected Order</TableHead>
                      <TableHead>Expected Part</TableHead>
                      <TableHead>Actual Order</TableHead>
                      <TableHead>Actual Part</TableHead>
                      <TableHead>Format</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testRunResults.results.map((test, index) => (
                      <TableRow key={index} className={test.passed ? '' : 'bg-destructive/10'}>
                        <TableCell>
                          {test.passed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-destructive" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono">{test.input}</TableCell>
                        <TableCell className="font-mono">{test.expected?.orderNumber || '-'}</TableCell>
                        <TableCell className="font-mono">{test.expected?.partNumber || '-'}</TableCell>
                        <TableCell className="font-mono">{test.actual?.orderNumber || '-'}</TableCell>
                        <TableCell className="font-mono">{test.actual?.partNumber || '-'}</TableCell>
                        <TableCell className="text-xs">{test.actual?.format || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Test Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Test Examples</CardTitle>
            <CardDescription>Click to test common patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['12345/678', '1000/1', '12345-123/1234', '12345-678', '1234-12345', '123-5678', '12345-678-901'].map((example) => (
                <Button
                  key={example}
                  variant="outline"
                  className="font-mono"
                  onClick={() => {
                    setTestInput(example);
                    setTestResults(null);
                  }}
                  data-testid={`button-example-${example}`}
                >
                  {example}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
