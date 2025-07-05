
import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';

// Temporary tab components (replace with real ones or import)
const Dashboard = () => <div>Dashboard</div>;
const Leads = () => <div>Leads</div>;
const KYC = () => <div>KYC</div>;
const Clients = () => <div>Clients</div>;
const SIP = () => <div>SIP</div>;
const Communication = () => <div>Communication</div>;
const Email = () => <div>Email</div>;
const Tasks = () => <div>Tasks</div>;
const InvestmentTracker = () => <div>Investment Tracker</div>;

export default function CRMDashboardRouter() {
  return (
    <div>
      <nav className="tabs flex gap-4 p-4 bg-gray-100 border-b">
        <NavLink to="/dashboard" className={({ isActive }) =>
          isActive ? 'font-semibold text-blue-600' : 'text-gray-600'}>
          Dashboard
        </NavLink>
        <NavLink to="/dashboard/leads" className={({ isActive }) =>
          isActive ? 'font-semibold text-blue-600' : 'text-gray-600'}>
          Leads
        </NavLink>
        <NavLink to="/dashboard/kyc" className={({ isActive }) =>
          isActive ? 'font-semibold text-blue-600' : 'text-gray-600'}>
          KYC
        </NavLink>
        <NavLink to="/dashboard/clients" className={({ isActive }) =>
          isActive ? 'font-semibold text-blue-600' : 'text-gray-600'}>
          Clients
        </NavLink>
        <NavLink to="/dashboard/sip" className={({ isActive }) =>
          isActive ? 'font-semibold text-blue-600' : 'text-gray-600'}>
          SIP
        </NavLink>
        <NavLink to="/dashboard/communication" className={({ isActive }) =>
          isActive ? 'font-semibold text-blue-600' : 'text-gray-600'}>
          Communication
        </NavLink>
        <NavLink to="/dashboard/email" className={({ isActive }) =>
          isActive ? 'font-semibold text-blue-600' : 'text-gray-600'}>
          Email
        </NavLink>
        <NavLink to="/dashboard/tasks" className={({ isActive }) =>
          isActive ? 'font-semibold text-blue-600' : 'text-gray-600'}>
          Tasks
        </NavLink>
        <NavLink to="/dashboard/investment-tracker" className={({ isActive }) =>
          isActive ? 'font-semibold text-blue-600' : 'text-gray-600'}>
          Investment Tracker
        </NavLink>
      </nav>

      <div className="p-4">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/leads" element={<Leads />} />
          <Route path="/dashboard/kyc" element={<KYC />} />
          <Route path="/dashboard/clients" element={<Clients />} />
          <Route path="/dashboard/sip" element={<SIP />} />
          <Route path="/dashboard/communication" element={<Communication />} />
          <Route path="/dashboard/email" element={<Email />} />
          <Route path="/dashboard/tasks" element={<Tasks />} />
          <Route path="/dashboard/investment-tracker" element={<InvestmentTracker />} />
        </Routes>
      </div>
    </div>
  );
}
