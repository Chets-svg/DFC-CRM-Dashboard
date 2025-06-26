import { useState, useEffect } from 'react'
import { Button } from "/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "/components/ui/table"
import { Input } from "/components/ui/input"
import { Edit, Moon, Sun, Save, X } from "lucide-react"

type MonthData = {
  month: string
  sipTarget: number
  sipAchieved: number
  lumpsumTarget: number
  lumpsumAchieved: number
}

export default function AmountTracker() {
  const [darkMode, setDarkMode] = useState(false)
  const currentMonth = new Date().toLocaleString('default', { month: 'long' })
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Default targets
  const [monthlySipTarget, setMonthlySipTarget] = useState(15000)
  const [annualLumpsumTarget, setAnnualLumpsumTarget] = useState(4000000)
  const [editingTargets, setEditingTargets] = useState(false)

  const [monthlyData, setMonthlyData] = useState<MonthData[]>(months.map(month => ({
    month,
    sipTarget: monthlySipTarget,
    sipAchieved: month === 'January' ? 15000 : 
                 month === 'March' ? 7000 :
                 month === 'May' ? 14000 : 0,
    lumpsumTarget: month === 'January' ? annualLumpsumTarget : 0,
    lumpsumAchieved: month === 'January' ? 85000 : 0
  })))

  const [editingMonth, setEditingMonth] = useState<string | null>(null)
  const [editData, setEditData] = useState<Omit<MonthData, 'month'>>({
    sipTarget: monthlySipTarget,
    sipAchieved: 0,
    lumpsumTarget: 0,
    lumpsumAchieved: 0
  })

  // Update monthly data when targets change
  useEffect(() => {
    setMonthlyData(prev => prev.map(m => ({
      ...m,
      sipTarget: monthlySipTarget,
      lumpsumTarget: m.month === 'January' ? annualLumpsumTarget : 0
    })))
  }, [monthlySipTarget, annualLumpsumTarget])

  // Toggle dark mode and save preference
  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', String(newMode))
  }

  // Load dark mode preference
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedMode)
  }, [])

  // Calculate summaries
  const yearlySipTarget = monthlyData.reduce((sum, m) => sum + m.sipTarget, 0)
  const yearlySipAchieved = monthlyData.reduce((sum, m) => sum + m.sipAchieved, 0)
  const yearlySipDeficit = yearlySipTarget - yearlySipAchieved
  const sipProgress = (yearlySipAchieved / yearlySipTarget) * 100

  const yearlyLumpsumTarget = monthlyData.reduce((sum, m) => sum + m.lumpsumTarget, 0)
  const yearlyLumpsumAchieved = monthlyData.reduce((sum, m) => sum + m.lumpsumAchieved, 0)
  const yearlyLumpsumDeficit = yearlyLumpsumTarget - yearlyLumpsumAchieved
  const lumpsumProgress = yearlyLumpsumTarget > 0 
    ? (yearlyLumpsumAchieved / yearlyLumpsumTarget) * 100 
    : 0

  const totalTarget = yearlySipTarget + yearlyLumpsumTarget
  const totalAchieved = yearlySipAchieved + yearlyLumpsumAchieved
  const totalDeficit = totalTarget - totalAchieved
  const totalProgress = totalTarget > 0 ? (totalAchieved / totalTarget) * 100 : 0

  const startEditing = (month: string) => {
    const monthData = monthlyData.find(m => m.month === month)
    if (monthData) {
      setEditingMonth(month)
      setEditData({
        sipTarget: monthData.sipTarget,
        sipAchieved: monthData.sipAchieved,
        lumpsumTarget: monthData.lumpsumTarget,
        lumpsumAchieved: monthData.lumpsumAchieved
      })
    }
  }

  const saveEdit = () => {
    if (!editingMonth) return

    setMonthlyData(monthlyData.map(m => 
      m.month === editingMonth 
        ? { ...m, ...editData }
        : m
    ))
    setEditingMonth(null)
  }

  const cancelEdit = () => {
    setEditingMonth(null)
  }

  const saveTargets = () => {
    setEditingTargets(false)
  }

  const cancelTargets = () => {
    setEditingTargets(false)
  }

  const handleInputChange = (field: keyof typeof editData, value: string) => {
    const numValue = value ? parseInt(value.replace(/\D/g, '')) || 0 : 0
    setEditData(prev => ({ ...prev, [field]: numValue }))
  }

  // Theme classes
  const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-50'
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white'
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900'
  const secondaryText = darkMode ? 'text-gray-400' : 'text-gray-600'
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200'
  const inputBg = darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'
  const tableRowBg = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
  const currentMonthBg = darkMode ? 'bg-blue-900' : 'bg-blue-50'

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} py-8 px-4 transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Investment Tracker - 2025</h1>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        <Card className={`${cardBg} ${borderColor}`}>
          <CardHeader>
            <CardTitle className={textColor}>Track your monthly investment goals and achievements</CardTitle>
            <CardDescription className={secondaryText}>
              Current Month: {currentMonth}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* SIP Summary Card */}
          <Card className={`${cardBg} ${borderColor}`}>
            <CardHeader>
              <CardTitle className={`text-lg ${textColor}`}>SIP Summary (Yearly)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className={textColor}>Target:</span>
                <span className={`font-medium ${textColor}`}>₹{yearlySipTarget.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className={textColor}>Achieved:</span>
                <span className={`font-medium ${textColor}`}>₹{yearlySipAchieved.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className={textColor}>Deficit:</span>
                <span className={`font-medium ${yearlySipAchieved < yearlySipTarget ? 'text-red-500' : textColor}`}>
                  -₹{yearlySipDeficit.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-2">
                <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5`}>
                  <div 
                    className="h-2.5 rounded-full bg-blue-600" 
                    style={{ width: `${sipProgress}%` }}
                  ></div>
                </div>
                <div className={`text-sm text-center mt-1 ${textColor}`}>
                  Progress: {sipProgress.toFixed(0)}%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lumpsum Summary Card */}
          <Card className={`${cardBg} ${borderColor}`}>
            <CardHeader>
              <CardTitle className={`text-lg ${textColor}`}>Lumpsum Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className={textColor}>Target:</span>
                <span className={`font-medium ${textColor}`}>₹{yearlyLumpsumTarget.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className={textColor}>Achieved:</span>
                <span className={`font-medium ${textColor}`}>₹{yearlyLumpsumAchieved.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className={textColor}>Deficit:</span>
                <span className={`font-medium ${yearlyLumpsumAchieved < yearlyLumpsumTarget ? 'text-red-500' : textColor}`}>
                  -₹{yearlyLumpsumDeficit.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-2">
                <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5`}>
                  <div 
                    className="h-2.5 rounded-full bg-green-600" 
                    style={{ width: `${lumpsumProgress}%` }}
                  ></div>
                </div>
                <div className={`text-sm text-center mt-1 ${textColor}`}>
                  Progress: {lumpsumProgress.toFixed(0)}%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2025 Summary Card */}
          <Card className={`${cardBg} ${borderColor}`}>
            <CardHeader>
              <CardTitle className={`text-lg ${textColor}`}>2025 Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className={textColor}>Target:</span>
                <span className={`font-medium ${textColor}`}>₹{totalTarget.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className={textColor}>Achieved:</span>
                <span className={`font-medium ${textColor}`}>₹{totalAchieved.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className={textColor}>Deficit:</span>
                <span className={`font-medium ${totalAchieved < totalTarget ? 'text-red-500' : textColor}`}>
                  -₹{totalDeficit.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-2">
                <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5`}>
                  <div 
                    className="h-2.5 rounded-full bg-purple-600" 
                    style={{ width: `${totalProgress}%` }}
                  ></div>
                </div>
                <div className={`text-sm text-center mt-1 ${textColor}`}>
                  Progress: {totalProgress.toFixed(0)}%
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className={`${cardBg} ${borderColor}`}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className={`text-lg ${textColor}`}>Monthly SIP Target</CardTitle>
                  {editingTargets ? (
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        value={monthlySipTarget.toLocaleString('en-IN')}
                        onChange={(e) => setMonthlySipTarget(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                        className={`w-32 ${inputBg}`}
                      />
                    </div>
                  ) : (
                    <CardDescription className={secondaryText}>
                      ₹{monthlySipTarget.toLocaleString('en-IN')}
                    </CardDescription>
                  )}
                </div>
                {editingTargets ? (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={cancelTargets}>
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                    <Button size="sm" onClick={saveTargets}>
                      <Save className="w-4 h-4 mr-2" /> Save
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setEditingTargets(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          <Card className={`${cardBg} ${borderColor}`}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className={`text-lg ${textColor}`}>Annual Lumpsum Target</CardTitle>
                  {editingTargets ? (
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        value={annualLumpsumTarget.toLocaleString('en-IN')}
                        onChange={(e) => setAnnualLumpsumTarget(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                        className={`w-32 ${inputBg}`}
                      />
                    </div>
                  ) : (
                    <CardDescription className={secondaryText}>
                      ₹{annualLumpsumTarget.toLocaleString('en-IN')}
                    </CardDescription>
                  )}
                </div>
                {editingTargets ? (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={cancelTargets}>
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                    <Button size="sm" onClick={saveTargets}>
                      <Save className="w-4 h-4 mr-2" /> Save
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setEditingTargets(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>
        </div>

        <Card className={`${cardBg} ${borderColor}`}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className={textColor}>Monthly Investment Details</CardTitle>
                <CardDescription className={secondaryText}>
                  {editingMonth 
                    ? `Editing ${editingMonth} data` 
                    : 'Click "Edit" to update monthly values'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <TableHead className={textColor}>Month</TableHead>
                  <TableHead className={textColor}>SIP Target</TableHead>
                  <TableHead className={textColor}>SIP Achieved</TableHead>
                  <TableHead className={textColor}>Deficit</TableHead>
                  <TableHead className={textColor}>Lumpsum Target</TableHead>
                  <TableHead className={textColor}>Lumpsum Achieved</TableHead>
                  <TableHead className={textColor}>Deficit</TableHead>
                  <TableHead className={textColor}>Actions</TableHead>
                </TableHead>
              </TableHeader>
              <TableBody>
                {monthlyData.map((monthData) => (
                  <TableRow 
                    key={monthData.month} 
                    className={`${monthData.month === currentMonth ? currentMonthBg : ''} ${tableRowBg}`}
                  >
                    <TableCell className={`font-medium ${textColor}`}>
                      {monthData.month}
                      {monthData.month === currentMonth && ' (Current)'}
                    </TableCell>
                    
                    {editingMonth === monthData.month ? (
                      <>
                        <TableCell>
                          <Input
                            value={editData.sipTarget.toLocaleString('en-IN')}
                            onChange={(e) => handleInputChange('sipTarget', e.target.value)}
                            className={`w-24 ${inputBg} ${textColor}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editData.sipAchieved.toLocaleString('en-IN')}
                            onChange={(e) => handleInputChange('sipAchieved', e.target.value)}
                            className={`w-24 ${inputBg} ${textColor}`}
                          />
                        </TableCell>
                        <TableCell className={textColor}>
                          ₹{(editData.sipTarget - editData.sipAchieved).toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editData.lumpsumTarget.toLocaleString('en-IN')}
                            onChange={(e) => handleInputChange('lumpsumTarget', e.target.value)}
                            className={`w-24 ${inputBg} ${textColor}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editData.lumpsumAchieved.toLocaleString('en-IN')}
                            onChange={(e) => handleInputChange('lumpsumAchieved', e.target.value)}
                            className={`w-24 ${inputBg} ${textColor}`}
                          />
                        </TableCell>
                        <TableCell className={textColor}>
                          ₹{(editData.lumpsumTarget - editData.lumpsumAchieved).toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={cancelEdit}
                              className={darkMode ? 'border-gray-600' : ''}
                            >
                              Cancel
                            </Button>
                            <Button size="sm" onClick={saveEdit}>
                              Save
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className={textColor}>₹{monthData.sipTarget.toLocaleString('en-IN')}</TableCell>
                        <TableCell className={textColor}>₹{monthData.sipAchieved.toLocaleString('en-IN')}</TableCell>
                        <TableCell className={`${monthData.sipAchieved < monthData.sipTarget ? 'text-red-500' : textColor}`}>
                          -₹{(monthData.sipTarget - monthData.sipAchieved).toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className={textColor}>₹{monthData.lumpsumTarget.toLocaleString('en-IN')}</TableCell>
                        <TableCell className={textColor}>₹{monthData.lumpsumAchieved.toLocaleString('en-IN')}</TableCell>
                        <TableCell className={`${monthData.lumpsumAchieved < monthData.lumpsumTarget ? 'text-red-500' : textColor}`}>
                          -₹{(monthData.lumpsumTarget - monthData.lumpsumAchieved).toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => startEditing(monthData.month)}
                            className={darkMode ? 'border-gray-600' : ''}
                          >
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </Button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}