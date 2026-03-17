import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { LayoutDashboard, Receipt, Settings, Plus, UploadCloud, LogOut, TrendingUp, TrendingDown, Target, Trash2, Repeat, CalendarRange, Trophy } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

function App() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('kuba@test.pl');
  const [password, setPassword] = useState('haslo123');

  const [transactions, setTransactions] = useState([]);
  const [analyzedData, setAnalyzedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const [periodFilter, setPeriodFilter] = useState('ALL');
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [tempBudget, setTempBudget] = useState(0);

  const [manualType, setManualType] = useState('EXPENSE');

  const [manualForm, setManualForm] = useState({
    merchant: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Nowy stan: Cele finansowe
  const [goals, setGoals] = useState([
    { id: 1, name: 'Poduszka Finansowa', target: 20000, current: 5000 },
    { id: 2, name: 'Nowy Laptop', target: 8000, current: 1500 }
  ]);
  const [newGoal, setNewGoal] = useState({ name: '', target: '' });

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      fetchTransactions(savedToken);
      fetchUserSettings(savedToken);
    }
  }, []);

  const fetchTransactions = async (t) => {
    try {
      const res = await axios.get('http://localhost:8080/api/expenses/myExpenses', {
        headers: { 'Authorization': `Bearer ${t}` }
      });
      const data = res.data.map(item => ({
        ...item,
        type: item.type || 'EXPENSE'
      }));
      setTransactions(data);
    } catch (e) { console.error("Błąd pobierania danych z bazy"); }
  };

  const fetchUserSettings = async (t) => {
    try {
      const res = await axios.get('http://localhost:8080/api/user/settings', {
        headers: { 'Authorization': `Bearer ${t}` }
      });
      setMonthlyBudget(res.data.budget);
      setTempBudget(res.data.budget);
    } catch (e) { console.error("Błąd pobierania ustawień"); }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      fetchTransactions(res.data.token);
      fetchUserSettings(res.data.token);
    } catch (e) { alert("Błąd autoryzacji. Serwer działa?"); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setTransactions([]);
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Na pewno chcesz usunąć tę pozycję z rejestru?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/expenses/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTransactions(token);
    } catch (e) {
      alert("Błąd podczas usuwania. Sprawdź backend.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:8080/api/expenses/analyzeReceipt', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAnalyzedData({ ...res.data, type: 'EXPENSE' });
      setActiveMenu('add');
    } catch (e) {
      alert("AI nie poradziło sobie ze zdjęciem.");
    } finally { setLoading(false); }
  };

  const handleSaveTransaction = async (dataToSave) => {
    try {
      await axios.post('http://localhost:8080/api/expenses/addExpense', dataToSave, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert("Zapisano pomyślnie w systemie!");
      setAnalyzedData(null);
      setManualForm({
        merchant: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchTransactions(token);
    } catch (e) { alert("Błąd bazy danych."); }
  };

  const handleSaveBudget = async () => {
    try {
      await axios.put('http://localhost:8080/api/user/budget', { budget: parseFloat(tempBudget) }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMonthlyBudget(parseFloat(tempBudget));
      alert("✅ Budżet zaktualizowany w bazie!");
    } catch (e) { alert("❌ Błąd zapisu budżetu."); }
  };

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.target) return;
    setGoals([...goals, { id: Date.now(), name: newGoal.name, target: parseFloat(newGoal.target), current: 0 }]);
    setNewGoal({ name: '', target: '' });
  };

  const filteredTransactions = useMemo(() => {
    if (periodFilter === 'ALL') return transactions;

    const now = new Date();
    return transactions.filter(t => {
      if (!t.date) return true;
      const tDate = new Date(t.date);

      if (periodFilter === 'THIS_MONTH') {
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      }
      if (periodFilter === 'LAST_MONTH') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return tDate.getMonth() === lastMonth.getMonth() && tDate.getFullYear() === lastMonth.getFullYear();
      }
      return true;
    });
  }, [transactions, periodFilter]);

  const analytics = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalSubscriptions = 0;
    const categoryMap = {};
    const merchantMap = {};

    filteredTransactions.forEach(t => {
      const amount = parseFloat(t.totalAmount);
      if (t.type === 'INCOME') {
        totalIncome += amount;
      } else if (t.type === 'SUBSCRIPTION') {
        totalSubscriptions += amount;
        totalExpense += amount;
      } else {
        totalExpense += amount;
      }

      if (t.type !== 'INCOME') {
        const cat = t.category ? t.category.trim().toUpperCase() : 'INNE';
        const merch = t.merchant ? t.merchant.trim().toUpperCase() : 'NIEZNANY';
        categoryMap[cat] = (categoryMap[cat] || 0) + amount;
        merchantMap[merch] = (merchantMap[merch] || 0) + amount;
      }
    });

    const balance = totalIncome - totalExpense;
    const pieData = Object.keys(categoryMap).map(name => ({ name, value: categoryMap[name] }));
    const topMerchant = Object.entries(merchantMap).sort((a,b) => b[1] - a[1])[0] || ['Brak', 0];

    const barData = Object.keys(merchantMap).map(name => ({
      merchant: name,
      totalAmount: parseFloat(merchantMap[name].toFixed(2))
    })).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 10);

    return { totalIncome, totalExpense, totalSubscriptions, balance, pieData, topMerchant, barData };
  }, [filteredTransactions]);

  if (!token) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans">
      <div className="bg-white p-10 rounded-xl shadow-2xl w-[400px]">
        <h1 className="text-3xl font-black text-slate-900 mb-2">ExpenseMind <span className="text-blue-600">Pro</span></h1>
        <p className="text-slate-500 mb-8 text-sm">System Analizy Finansowej</p>
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Adres Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">Hasło Autoryzacyjne</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold">Uzyskaj dostęp</button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-black text-white">ExpenseMind</h1>
          <p className="text-[10px] font-bold tracking-widest text-blue-400 uppercase mt-1">Workspace Analityczny</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button onClick={() => setActiveMenu('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMenu === 'dashboard' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard size={20}/> Dashboard
          </button>
          <button onClick={() => setActiveMenu('ledger')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMenu === 'ledger' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Receipt size={20}/> Rejestr
          </button>
          <button onClick={() => setActiveMenu('subscriptions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMenu === 'subscriptions' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Repeat size={20}/> Subskrypcje
          </button>
           <button onClick={() => setActiveMenu('goals')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMenu === 'goals' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Trophy size={20}/> Cele
          </button>
          <button onClick={() => setActiveMenu('add')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMenu === 'add' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Plus size={20}/> Wprowadź Dane
          </button>
          <button onClick={() => setActiveMenu('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeMenu === 'settings' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Settings size={20}/> Parametry
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors text-white">
            <LogOut size={16}/> Wyloguj
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10">
        {activeMenu === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Podsumowanie Finansowe</h2>
                <p className="text-slate-500 mt-1">Analiza w czasie rzeczywistym.</p>
              </div>
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                <CalendarRange size={18} className="text-slate-500"/>
                <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)} className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer">
                  <option value="ALL">Cała historia</option>
                  <option value="THIS_MONTH">Bieżący miesiąc</option>
                  <option value="LAST_MONTH">Poprzedni miesiąc</option>
                </select>
              </div>
            </header>

            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bieżące Saldo</p>
                <h3 className={`text-3xl font-black ${analytics.balance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                  {analytics.balance.toFixed(2)} zł
                </h3>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Przychody</p>
                <h3 className="text-3xl font-black text-emerald-600">+{analytics.totalIncome.toFixed(2)} zł</h3>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Wydatki</p>
                <h3 className="text-3xl font-black text-rose-600">-{analytics.totalExpense.toFixed(2)} zł</h3>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Budżet ({monthlyBudget} zł)</p>
                  <Target className="text-blue-500 opacity-50" size={20}/>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full mb-2 overflow-hidden">
                  <div className={`h-full rounded-full ${analytics.totalExpense > monthlyBudget ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${monthlyBudget > 0 ? Math.min((analytics.totalExpense / monthlyBudget) * 100, 100) : 0}%`}}></div>
                </div>
                <p className="text-xs font-bold text-slate-900">
                  Wykorzystano {monthlyBudget > 0 ? ((analytics.totalExpense / monthlyBudget) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-sm">Rozkład Kategorii</h4>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analytics.pieData} innerRadius={80} outerRadius={110} paddingAngle={2} dataKey="value">
                        {analytics.pieData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} zł`} />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-sm">Zestawienie Sklepów (Top 10)</h4>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.barData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="merchant" tick={{fontSize: 10}} stroke="#64748b" />
                      <YAxis tick={{fontSize: 10}} stroke="#64748b" />
                      <Tooltip cursor={{fill: '#f8fafc'}} formatter={(value) => `${value} zł`} />
                      <Bar dataKey="totalAmount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'goals' && (
          <div className="space-y-6 animate-in fade-in">
             <header>
              <h2 className="text-3xl font-black text-slate-900">Cele Finansowe</h2>
              <p className="text-slate-500 mt-1">Śledź postępy w oszczędzaniu na wymarzone rzeczy.</p>
            </header>

            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">Dodaj Nowy Cel</h4>
                <input type="text" placeholder="Nazwa celu" value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} className="w-full p-3 mb-3 border border-slate-200 rounded-lg text-sm" />
                <input type="number" placeholder="Kwota docelowa" value={newGoal.target} onChange={e => setNewGoal({...newGoal, target: e.target.value})} className="w-full p-3 mb-4 border border-slate-200 rounded-lg text-sm" />
                <button onClick={handleAddGoal} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">Utwórz Cel</button>
              </div>

              {goals.map(goal => {
                const percent = Math.min((goal.current / goal.target) * 100, 100);
                return (
                  <div key={goal.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-slate-900">{goal.name}</h4>
                      <Trophy size={20} className="text-amber-500"/>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full mb-2 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{width: `${percent}%`}}></div>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-900">{goal.current} zł</span>
                      <span className="text-slate-500">Z {goal.target} zł</span>
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-4 text-center">Zrealizowano {percent.toFixed(1)}%</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeMenu === 'subscriptions' && (
          <div className="space-y-6 animate-in fade-in">
            <header>
              <h2 className="text-3xl font-black text-slate-900">Koszty Stałe i Subskrypcje</h2>
              <p className="text-slate-500 mt-1">Zarządzaj powtarzalnymi płatnościami (Netflix, Czynsz, Siłownia).</p>
            </header>
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {transactions.filter(t => t.type === 'SUBSCRIPTION').map((sub, idx) => (
                  <div key={idx} className="p-6 border border-slate-100 rounded-xl bg-slate-50 flex flex-col items-center text-center shadow-sm">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                      <Repeat size={24}/>
                    </div>
                    <h4 className="font-bold text-slate-900">{sub.merchant}</h4>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">{sub.category}</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-4">{sub.totalAmount} zł<span className="text-sm text-slate-500 font-normal">/mc</span></h3>
                    <button onClick={() => handleDeleteTransaction(sub.id)} className="mt-4 text-xs font-bold text-red-500 hover:text-red-700">Usuń</button>
                  </div>
                ))}
                {transactions.filter(t => t.type === 'SUBSCRIPTION').length === 0 && (
                  <p className="col-span-3 text-center text-slate-500 py-10">Brak aktywnych subskrypcji. Dodaj je w zakładce "Wprowadź Dane".</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'ledger' && (
          <div className="space-y-6 animate-in fade-in">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Rejestr Transakcji</h2>
                <p className="text-slate-500 mt-1">Pełna baza danych operacji.</p>
              </div>
            </header>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="p-4 font-bold">Data</th>
                    <th className="p-4 font-bold">Typ</th>
                    <th className="p-4 font-bold">Podmiot / Sklep</th>
                    <th className="p-4 font-bold">Kategoria</th>
                    <th className="p-4 font-bold text-right">Kwota</th>
                    <th className="p-4 font-bold text-center">Akcja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.slice().reverse().map((t, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-4 text-sm text-slate-600">{t.date || 'Brak daty'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : t.type === 'SUBSCRIPTION' ? 'bg-purple-100 text-purple-700' : 'bg-rose-100 text-rose-700'}`}>
                          {t.type === 'INCOME' ? 'Przychód' : t.type === 'SUBSCRIPTION' ? 'Subskrypcja' : 'Wydatek'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-900">{t.merchant}</td>
                      <td className="p-4 text-sm text-slate-600">{t.category?.toUpperCase() || 'BRAK'}</td>
                      <td className={`p-4 text-right font-black ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{t.totalAmount} zł
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleDeleteTransaction(t.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100">
                          <Trash2 size={18}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-500">Brak danych w rejestrze.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === 'add' && (
          <div className="space-y-6 animate-in fade-in">
            <header>
              <h2 className="text-3xl font-black text-slate-900">Wprowadzanie Danych</h2>
              <p className="text-slate-500 mt-1">Zeskanuj paragon przez AI lub wpisz dane ręcznie.</p>
            </header>
            <div className="grid grid-cols-2 gap-8">

              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                  <UploadCloud size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Skaner AI (OCR)</h3>
                <p className="text-sm text-slate-500 mb-8">Wgraj zdjęcie paragonu, a nasz silnik AI automatycznie wyodrębni kwotę, sklep i przypisze kategorię.</p>
                <label className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-bold transition-colors shadow-md">
                  <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                  {loading ? 'Analizowanie...' : 'Wybierz plik paragonu'}
                </label>
              </div>

              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">
                  {analyzedData ? '✅ Wynik analizy AI' : '✏️ Wprowadzanie Ręczne'}
                </h3>

                {analyzedData ? (
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase">Podmiot</p>
                      <p className="text-lg font-bold">{analyzedData.merchant}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase">Kwota</p>
                      <p className="text-2xl font-black text-rose-600">{analyzedData.totalAmount} zł</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase">Kategoria</p>
                      <p className="text-sm font-bold bg-slate-100 px-3 py-1 rounded inline-block mt-1">{analyzedData.category}</p>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button onClick={() => setAnalyzedData(null)} className="flex-1 py-3 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50">Odrzuć</button>
                      <button onClick={() => handleSaveTransaction(analyzedData)} className="flex-1 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800">Zapisz w Bazie</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex p-1 bg-slate-100 rounded-lg mb-4">
                      <button onClick={() => setManualType('EXPENSE')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${manualType === 'EXPENSE' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Wydatek</button>
                      <button onClick={() => setManualType('INCOME')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${manualType === 'INCOME' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Przychód</button>
                      <button onClick={() => setManualType('SUBSCRIPTION')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${manualType === 'SUBSCRIPTION' ? 'bg-purple-600 shadow-sm text-white' : 'text-slate-500'}`}>Subskrypcja</button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nazwa / Podmiot</label>
                        <input type="text" value={manualForm.merchant} onChange={e => setManualForm({...manualForm, merchant: e.target.value})} className="w-full mt-1 p-3 border border-slate-200 rounded-lg" placeholder="np. Wypłata, Biedronka..." />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Kwota (PLN)</label>
                        <input type="number" value={manualForm.amount} onChange={e => setManualForm({...manualForm, amount: e.target.value})} className="w-full mt-1 p-3 border border-slate-200 rounded-lg" placeholder="0.00" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Data</label>
                        <input type="date" value={manualForm.date} onChange={e => setManualForm({...manualForm, date: e.target.value})} className="w-full mt-1 p-3 border border-slate-200 rounded-lg" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Kategoria</label>
                        <input type="text" value={manualForm.category} onChange={e => setManualForm({...manualForm, category: e.target.value})} className="w-full mt-1 p-3 border border-slate-200 rounded-lg" placeholder="np. Wynagrodzenie, Jedzenie..." />
                      </div>
                    </div>

                    <button
                      onClick={() => handleSaveTransaction({
                        merchant: manualForm.merchant,
                        totalAmount: parseFloat(manualForm.amount),
                        category: manualForm.category,
                        type: manualType,
                        date: manualForm.date
                      })}
                      className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold mt-4"
                    >
                      Dodaj do Rejestru
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'settings' && (
          <div className="space-y-6 animate-in fade-in max-w-2xl">
            <header>
              <h2 className="text-3xl font-black text-slate-900">Parametry Systemu</h2>
            </header>
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Miesięczny Cel Budżetowy</h3>
                <div className="flex gap-4 items-center mt-4">
                  <input
                    type="number"
                    value={tempBudget}
                    onChange={(e) => setTempBudget(e.target.value)}
                    className="w-48 p-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-lg"
                  />
                  <span className="text-slate-500 font-bold">PLN</span>
                  <button onClick={handleSaveBudget} className="ml-auto px-6 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800">
                    Zapisz w Bazie
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;