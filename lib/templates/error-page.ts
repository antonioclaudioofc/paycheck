export const rateLimitHtml = `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Erro Inesperado - Paycheck</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #f8fafc;
      --color: #0f172a;
      --card-bg: #ffffff;
      --card-border: #e2e8f0;
      --title-color: #0f172a;
      --text-color: #64748b;
      --primary: #2b7fff;
      --primary-hover: #1e60d8;
      --shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
    }
    
    html.dark {
      --bg: #09090b;
      --color: #fafafa;
      --card-bg: #121214;
      --card-border: #27272a;
      --title-color: #fafafa;
      --text-color: #a1a1aa;
      --primary: #6366f1;
      --primary-hover: #4f46e5;
      --shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    }

    body {
      margin: 0;
      padding: 0;
      font-family: 'Poppins', sans-serif;
      background-color: var(--bg);
      color: var(--color);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      box-sizing: border-box;
      transition: background-color 0.3s, color 0.3s;
    }
    .container {
      max-width: 480px;
      width: 100%;
      padding: 2.5rem;
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 24px;
      box-shadow: var(--shadow);
      transition: background-color 0.3s, border-color 0.3s, box-shadow 0.3s;
    }
    .icon {
      width: 64px;
      height: 64px;
      color: var(--primary);
      margin: 0 auto 1.5rem;
      transition: color 0.3s;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 0.75rem;
      color: var(--title-color);
      transition: color 0.3s;
    }
    p {
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--text-color);
      margin: 0 0 2rem;
      transition: color 0.3s;
    }
    .btn {
      display: inline-block;
      width: 100%;
      padding: 0.85rem 1.5rem;
      font-size: 0.95rem;
      font-weight: 600;
      color: #ffffff;
      background-color: var(--primary);
      border: none;
      border-radius: 12px;
      cursor: pointer;
      text-decoration: none;
      transition: background-color 0.2s, transform 0.1s;
      box-sizing: border-box;
    }
    .btn:hover {
      background-color: var(--primary-hover);
    }
    .btn:active {
      transform: scale(0.98);
    }
  </style>
</head>
<body>
  <div class="container">
    <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
    </svg>
    <h1>Ocorreu um erro inesperado</h1>
    <p>Por favor, aguarde alguns instantes e recarregue a página.</p>
    <button class="btn" onclick="window.location.reload()">Recarregar Página</button>
  </div>
  <script>
    (function() {
      const theme = localStorage.getItem('theme');
      if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    })()
  </script>
</body>
</html>`;
