import React, { useState } from 'react';
import { login } from './services/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login(username, password);
      localStorage.setItem('token', response.token);
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  if (isLoggedIn) {
    return <Dashboard onLogout={() => setIsLoggedIn(false)} />;
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>AI 销售机器人系统</h1>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label>用户名:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>密码:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          登录
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#666' }}>
        测试账号: admin / admin123
      </p>
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'scripts' | 'customers'>('overview');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '250px', backgroundColor: '#1a1a1a', color: 'white', padding: '20px' }}>
        <h2 style={{ marginBottom: '30px' }}>AI 销售系统</h2>
        <nav>
          <div style={{ marginBottom: '10px' }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: activeTab === 'overview' ? '#333' : 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              仪表板
            </button>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <button
              onClick={() => setActiveTab('tasks')}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: activeTab === 'tasks' ? '#333' : 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              外呼任务
            </button>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <button
              onClick={() => setActiveTab('scripts')}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: activeTab === 'scripts' ? '#333' : 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              话术管理
            </button>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <button
              onClick={() => setActiveTab('customers')}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: activeTab === 'customers' ? '#333' : 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              客户管理
            </button>
          </div>
        </nav>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '20px',
            backgroundColor: '#e74c3c',
            border: 'none',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          退出登录
        </button>
      </aside>
      <main style={{ flex: 1, padding: '20px', backgroundColor: '#f5f5f5' }}>
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'tasks' && <Tasks />}
        {activeTab === 'scripts' && <Scripts />}
        {activeTab === 'customers' && <Customers />}
      </main>
    </div>
  );
}

function Overview() {
  return (
    <div>
      <h1>仪表板</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>今日通话</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#3498db' }}>156</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>接通率</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2ecc71' }}>68%</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>高意向客户</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#e67e22' }}>42</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>平均时长</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#9b59b6' }}>3.2分</p>
        </div>
      </div>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>最近通话记录</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>客户</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>状态</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>时长</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>意向</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>张先生 - 138****1234</td>
              <td style={{ padding: '10px' }}><span style={{ color: '#2ecc71' }}>已接通</span></td>
              <td style={{ padding: '10px' }}>4分32秒</td>
              <td style={{ padding: '10px' }}><span style={{ color: '#e67e22' }}>高意向</span></td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>李女士 - 139****5678</td>
              <td style={{ padding: '10px' }}><span style={{ color: '#2ecc71' }}>已接通</span></td>
              <td style={{ padding: '10px' }}>2分15秒</td>
              <td style={{ padding: '10px' }}><span style={{ color: '#f39c12' }}>中意向</span></td>
            </tr>
            <tr>
              <td style={{ padding: '10px' }}>王先生 - 137****9012</td>
              <td style={{ padding: '10px' }}><span style={{ color: '#e74c3c' }}>未接通</span></td>
              <td style={{ padding: '10px' }}>-</td>
              <td style={{ padding: '10px' }}><span style={{ color: '#95a5a6' }}>无</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Tasks() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>外呼任务</h1>
        <button style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          创建任务
        </button>
      </div>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>任务名称</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>状态</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>创建时间</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>春季促销活动</td>
              <td style={{ padding: '10px' }}><span style={{ color: '#2ecc71' }}>运行中</span></td>
              <td style={{ padding: '10px' }}>2026-02-10 09:00</td>
              <td style={{ padding: '10px' }}>
                <button style={{ padding: '5px 10px', marginRight: '5px', cursor: 'pointer' }}>详情</button>
                <button style={{ padding: '5px 10px', cursor: 'pointer' }}>暂停</button>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px' }}>VIP客户回访</td>
              <td style={{ padding: '10px' }}><span style={{ color: '#f39c12' }}></span>待执行</td>
              <td style={{ padding: '10px' }}>2026-02-10 14:00</td>
              <td style={{ padding: '10px' }}>
                <button style={{ padding: '5px 10px', marginRight: '5px', cursor: 'pointer' }}>详情</button>
                <button style={{ padding: '5px 10px', cursor: 'pointer' }}>启动</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Scripts() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>话术管理</h1>
        <button style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          创建话术
        </button>
      </div>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>话术名称</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>场景</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>状态</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>产品介绍话术</td>
              <td style={{ padding: '10px' }}>产品推广</td>
              <td style={{ padding: '10px' }}><span style={{ color: '#2ecc71' }}>启用</span></td>
              <td style={{ padding: '10px' }}>
                <button style={{ padding: '5px 10px', marginRight: '5px', cursor: 'pointer' }}>编辑</button>
                <button style={{ padding: '5px 10px', cursor: 'pointer' }}>预览</button>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px' }}>常见问题话术</td>
              <td style={{ padding: '10px' }}>客服支持</td>
              <td style={{ padding: '10px' }}><span style={{ color: '#2ecc71' }}>启用</span></td>
              <td style={{ padding: '10px' }}>
                <button style={{ padding: '5px 10px', marginRight: '5px', cursor: 'pointer' }}>编辑</button>
                <button style={{ padding: '5px 10px', cursor: 'pointer' }}>预览</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Customers() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>客户管理</h1>
        <div>
          <button style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>
            添加客户
          </button>
          <button style={{ padding: '10px 20px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            批量导入
          </button>
        </div>
      </div>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>姓名</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>电话</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>邮箱</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>状态</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>张先生</td>
              <td style={{ padding: '10px' }}>138****1234</td>
              <td style={{ padding: '10px' }}>zhang@example.com</td>
              <td style={{ padding: '10px' }}><span style={{ color: '#2ecc71' }}>活跃</span></td>
              <td style={{ padding: '10px' }}>
                <button style={{ padding: '5px 10px', marginRight: '5px', cursor: 'pointer' }}>编辑</button>
                <button style={{ padding: '5px 10px', cursor: 'pointer' }}>详情</button>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px' }}>李女士</td>
              <td style={{ padding: '10px' }}>139****5678</td>
              <td style={{ padding: '10px' }}>li@example.com</td>
              <td style={{ padding: '10px' }}><span style={{ color: '#2ecc71' }}>活跃</span></td>
              <td style={{ padding: '10px' }}>
                <button style={{ padding: '5px 10px', marginRight: '5px', cursor: 'pointer' }}>编辑</button>
                <button style={{ padding: '5px 10px', cursor: 'pointer' }}>详情</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
