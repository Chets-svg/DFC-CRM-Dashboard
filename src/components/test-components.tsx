"use client" // Required for client-side components in Next.js/React

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

export default function ComponentTestPage() {
  const [inputValue, setInputValue] = useState("")
  const [activeTab, setActiveTab] = useState("account")

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Shadcn Component Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Button Test */}
          <div className="space-x-2">
            <Button variant="default">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
          </div>

          {/* Input Test */}
          <div className="space-y-2">
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type something..."
            />
            <p className="text-sm text-muted-foreground">
              Input value: {inputValue || "Empty"}
            </p>
          </div>

          {/* Tabs Test */}
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <Card className="mt-4">
                <CardContent className="p-4">
                  Account content goes here
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings">
              <Card className="mt-4">
                <CardContent className="p-4">
                  Settings content goes here
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}