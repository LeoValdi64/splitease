"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Receipt,
  Users,
  Trash2,
  Copy,
  Check,
  DollarSign,
  Percent,
  Equal,
  Sliders,
  Calculator,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type SplitMode = "equal" | "custom" | "percentage";

interface Person {
  id: string;
  name: string;
  customAmount: number;
  percentage: number;
}

export default function SplitEase() {
  const [billTotal, setBillTotal] = useState<string>("");
  const [tipAmount, setTipAmount] = useState<string>("");
  const [taxAmount, setTaxAmount] = useState<string>("");
  const [people, setPeople] = useState<Person[]>([
    { id: "1", name: "Person 1", customAmount: 0, percentage: 100 },
  ]);
  const [newPersonName, setNewPersonName] = useState<string>("");
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [copied, setCopied] = useState(false);

  const grandTotal = useMemo(() => {
    const bill = parseFloat(billTotal) || 0;
    const tip = parseFloat(tipAmount) || 0;
    const tax = parseFloat(taxAmount) || 0;
    return bill + tip + tax;
  }, [billTotal, tipAmount, taxAmount]);

  const calculateSplits = useMemo(() => {
    if (people.length === 0 || grandTotal === 0) {
      return people.map((p) => ({ ...p, share: 0 }));
    }

    switch (splitMode) {
      case "equal":
        const equalShare = grandTotal / people.length;
        return people.map((p) => ({ ...p, share: equalShare }));

      case "custom":
        return people.map((p) => ({ ...p, share: p.customAmount }));

      case "percentage":
        return people.map((p) => ({
          ...p,
          share: (grandTotal * p.percentage) / 100,
        }));

      default:
        return people.map((p) => ({ ...p, share: 0 }));
    }
  }, [people, grandTotal, splitMode]);

  const totalAllocated = useMemo(() => {
    return calculateSplits.reduce((sum, p) => sum + p.share, 0);
  }, [calculateSplits]);

  const totalPercentage = useMemo(() => {
    return people.reduce((sum, p) => sum + p.percentage, 0);
  }, [people]);

  const addPerson = useCallback(() => {
    const name = newPersonName.trim() || `Person ${people.length + 1}`;
    const defaultPercentage =
      people.length === 0 ? 100 : 100 / (people.length + 1);

    setPeople((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name,
        customAmount: 0,
        percentage: defaultPercentage,
      },
    ]);
    setNewPersonName("");
  }, [newPersonName, people.length]);

  const removePerson = useCallback((id: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updatePerson = useCallback(
    (id: string, field: keyof Person, value: string | number) => {
      setPeople((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
      );
    },
    []
  );

  const splitEvenly = useCallback(() => {
    if (people.length === 0) return;
    const evenPercentage = 100 / people.length;
    setPeople((prev) =>
      prev.map((p) => ({ ...p, percentage: evenPercentage }))
    );
  }, [people.length]);

  const copyResults = useCallback(() => {
    const lines = [
      "SplitEase Summary",
      "================",
      "",
      `Bill: $${(parseFloat(billTotal) || 0).toFixed(2)}`,
      `Tip: $${(parseFloat(tipAmount) || 0).toFixed(2)}`,
      `Tax: $${(parseFloat(taxAmount) || 0).toFixed(2)}`,
      `Total: $${grandTotal.toFixed(2)}`,
      "",
      "Splits:",
      ...calculateSplits.map((p) => `  ${p.name}: $${p.share.toFixed(2)}`),
    ];

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [billTotal, tipAmount, taxAmount, grandTotal, calculateSplits]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Receipt className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">SplitEase</h1>
          </div>
          <p className="text-muted-foreground">
            Split bills effortlessly with friends
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Bill Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Bill Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="billTotal">Bill Total</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="billTotal"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={billTotal}
                    onChange={(e) => setBillTotal(e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tip">Tip</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="tip"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax">Tax</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="tax"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={taxAmount}
                      onChange={(e) => setTaxAmount(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                <span className="font-medium">Grand Total</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* People Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                People
                <Badge variant="secondary" className="ml-auto">
                  {people.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter name..."
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPerson()}
                />
                <Button onClick={addPerson} size="icon">
                  <UserPlus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {people.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                  >
                    <Input
                      value={person.name}
                      onChange={(e) =>
                        updatePerson(person.id, "name", e.target.value)
                      }
                      className="flex-1 h-8"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removePerson(person.id)}
                      disabled={people.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {people.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Add people to split the bill
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Split Mode Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Split Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={splitMode}
              onValueChange={(v) => setSplitMode(v as SplitMode)}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="equal" className="gap-2">
                  <Equal className="w-4 h-4" />
                  <span className="hidden sm:inline">Equal</span>
                </TabsTrigger>
                <TabsTrigger value="custom" className="gap-2">
                  <Sliders className="w-4 h-4" />
                  <span className="hidden sm:inline">Custom</span>
                </TabsTrigger>
                <TabsTrigger value="percentage" className="gap-2">
                  <Percent className="w-4 h-4" />
                  <span className="hidden sm:inline">Percentage</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="equal" className="mt-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">
                    Everyone pays equally:
                  </p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {formatCurrency(
                      people.length > 0 ? grandTotal / people.length : 0
                    )}{" "}
                    <span className="text-sm text-muted-foreground font-normal">
                      each
                    </span>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="custom" className="mt-4 space-y-3">
                {people.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg"
                  >
                    <span className="flex-1 font-medium truncate">
                      {person.name}
                    </span>
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={person.customAmount || ""}
                        onChange={(e) =>
                          updatePerson(
                            person.id,
                            "customAmount",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="pl-7 h-8"
                      />
                    </div>
                  </div>
                ))}

                {grandTotal > 0 && (
                  <div
                    className={`text-sm text-center p-2 rounded-lg ${
                      Math.abs(totalAllocated - grandTotal) < 0.01
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    Allocated: {formatCurrency(totalAllocated)} /{" "}
                    {formatCurrency(grandTotal)}
                    {Math.abs(totalAllocated - grandTotal) >= 0.01 && (
                      <span className="ml-2">
                        (
                        {totalAllocated > grandTotal
                          ? `+${formatCurrency(totalAllocated - grandTotal)}`
                          : formatCurrency(totalAllocated - grandTotal)}
                        )
                      </span>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="percentage" className="mt-4 space-y-3">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={splitEvenly}
                    className="gap-1"
                  >
                    <Equal className="w-3 h-3" />
                    Split Evenly
                  </Button>
                </div>

                {people.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg"
                  >
                    <span className="flex-1 font-medium truncate">
                      {person.name}
                    </span>
                    <div className="relative w-24">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={person.percentage || ""}
                        onChange={(e) =>
                          updatePerson(
                            person.id,
                            "percentage",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="pr-7 h-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        %
                      </span>
                    </div>
                    <span className="w-24 text-right font-medium">
                      {formatCurrency((grandTotal * person.percentage) / 100)}
                    </span>
                  </div>
                ))}

                <div
                  className={`text-sm text-center p-2 rounded-lg ${
                    Math.abs(totalPercentage - 100) < 0.01
                      ? "bg-primary/10 text-primary"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  Total: {totalPercentage.toFixed(1)}%
                  {Math.abs(totalPercentage - 100) >= 0.01 && (
                    <span className="ml-2">
                      (
                      {totalPercentage > 100
                        ? `+${(totalPercentage - 100).toFixed(1)}%`
                        : `${(totalPercentage - 100).toFixed(1)}%`}
                      )
                    </span>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Summary
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={copyResults}
              disabled={people.length === 0 || grandTotal === 0}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {people.length === 0 || grandTotal === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Add a bill and people to see the split summary
              </p>
            ) : (
              <div className="space-y-3">
                {calculateSplits.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {person.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{person.name}</span>
                    </div>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(person.share)}
                    </span>
                  </div>
                ))}

                <Separator />

                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-bold">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Built with Next.js and shadcn/ui
        </p>
      </div>
    </div>
  );
}
