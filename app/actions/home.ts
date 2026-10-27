const documentHtml = String.raw`<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f5f5ef">
  <meta name="description" content="今日のタスクを、ひとつずつ。シンプルなタスク管理アプリ。">
  <title>mori — 今日のタスク</title>
  <style>
    :root {
      color-scheme: light;
      --paper: #f5f5ef;
      --surface: #fffefa;
      --ink: #202920;
      --muted: #7b8279;
      --line: #e7e8df;
      --green: #385e48;
      --green-deep: #284936;
      --green-soft: #e8eee5;
      --orange: #d98d5d;
      --shadow: 0 18px 60px rgba(40, 54, 39, .055);
    }
    * { box-sizing: border-box; }
    html { background: var(--paper); }
    body {
      margin: 0;
      color: var(--ink);
      font-family: Inter, "Hiragino Sans", "Yu Gothic UI", "Meiryo", system-ui, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    button, input { font: inherit; }
    button { -webkit-tap-highlight-color: transparent; }
    button:focus-visible, input:focus-visible {
      outline: 3px solid #9eb79d;
      outline-offset: 3px;
    }
    .app-shell { width: min(100% - 44px, 1080px); margin: 0 auto; }
    .topbar {
      height: 82px; display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid rgba(46, 64, 46, .1);
    }
    .brand { display: flex; gap: 11px; align-items: center; color: inherit; text-decoration: none; }
    .brand-mark {
      width: 37px; height: 37px; display: grid; place-items: center; border-radius: 13px;
      background: var(--green); color: #fff; box-shadow: inset 0 0 0 1px rgba(255,255,255,.15);
    }
    .brand-name { font-family: Georgia, "Times New Roman", serif; font-size: 23px; letter-spacing: -.7px; line-height: 1; }
    .brand-sub { margin-top: 4px; color: var(--muted); font-size: 9px; text-transform: uppercase; letter-spacing: 2px; }
    .topbar-right { display: flex; align-items: center; gap: 13px; color: var(--muted); font-size: 12px; }
    .avatar { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 50%; background: #e4e9de; color: var(--green); font-weight: 700; }
    main { padding: 49px 0 60px; }
    .eyebrow { display: flex; align-items: center; gap: 9px; color: var(--green); font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; }
    .eyebrow-dot { width: 7px; height: 7px; background: var(--orange); border-radius: 50%; }
    .hero { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; margin-bottom: 30px; }
    h1 { margin: 10px 0 8px; font-family: Georgia, "Yu Mincho", "Hiragino Mincho ProN", serif; font-size: clamp(32px, 5vw, 48px); font-weight: 500; letter-spacing: -.055em; line-height: 1.2; }
    .hero-copy { max-width: 470px; margin: 0; color: var(--muted); font-size: 13px; }
    .date-card { flex-shrink: 0; padding: 14px 17px; border: 1px solid #e1e5d9; border-radius: 15px; background: rgba(255,255,255,.55); text-align: right; }
    .date-label { color: var(--muted); font-size: 9px; font-weight: 800; letter-spacing: 1.8px; }
    .date-value { margin-top: 3px; color: var(--green-deep); font-size: 13px; font-weight: 700; }
    .stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 13px; margin-bottom: 24px; }
    .stat { position: relative; min-height: 112px; overflow: hidden; padding: 19px 20px; border: 1px solid var(--line); border-radius: 17px; background: var(--surface); box-shadow: 0 4px 16px rgba(40,54,39,.018); }
    .stat-label { color: var(--muted); font-size: 11px; }
    .stat-number { margin-top: 4px; font-family: Georgia, serif; font-size: 32px; line-height: 1.25; letter-spacing: -.8px; }
    .stat-note { position: absolute; right: 18px; bottom: 22px; color: #9ba397; font-size: 10px; }
    .stat-accent { background: var(--green); border-color: var(--green); color: #fff; }
    .stat-accent .stat-label, .stat-accent .stat-note { color: #c9d7ca; }
    .stat-accent .stat-number { color: #fff; }
    .progress-line { height: 4px; overflow: hidden; margin-top: 10px; border-radius: 99px; background: rgba(255,255,255,.18); }
    .progress-fill { width: 0%; height: 100%; border-radius: inherit; background: #dce7bf; transition: width .25s ease; }
    .workspace { display: grid; grid-template-columns: minmax(0, 1fr) 248px; gap: 18px; align-items: start; }
    .task-panel, .side-panel { border: 1px solid var(--line); border-radius: 19px; background: var(--surface); box-shadow: var(--shadow); }
    .task-panel { min-width: 0; padding: 22px; }
    .panel-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 15px; margin-bottom: 19px; }
    .panel-title { margin: 0; font-family: Georgia, "Yu Mincho", serif; font-size: 22px; font-weight: 500; letter-spacing: -.5px; }
    .panel-subtitle { margin: 4px 0 0; color: var(--muted); font-size: 11px; }
    .today-badge { padding: 6px 10px; border-radius: 8px; background: #f0f2eb; color: #63745e; font-size: 10px; font-weight: 700; white-space: nowrap; }
    .add-form { display: flex; align-items: center; gap: 9px; padding: 7px 8px 7px 14px; border: 1px solid #e2e5db; border-radius: 12px; background: #fbfcf8; transition: border-color .2s, box-shadow .2s; }
    .add-form:focus-within { border-color: #9cae98; box-shadow: 0 0 0 3px rgba(86,122,82,.08); }
    .plus { display: grid; place-items: center; width: 25px; height: 25px; flex: 0 0 25px; border-radius: 8px; background: var(--green-soft); color: var(--green); font-size: 19px; line-height: 1; }
    .add-input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; color: var(--ink); font-size: 12px; }
    .add-input::placeholder { color: #9ba197; }
    .add-input:focus-visible { outline: 0; }
    .add-button { border: 0; border-radius: 9px; padding: 9px 13px; background: var(--green); color: #fff; cursor: pointer; font-size: 11px; font-weight: 700; transition: background .2s, transform .2s; }
    .add-button:hover { background: var(--green-deep); }
    .add-button:active { transform: scale(.98); }
    .filters { display: flex; gap: 6px; align-items: center; margin: 21px 0 11px; }
    .filter { border: 1px solid transparent; border-radius: 8px; padding: 7px 11px; background: transparent; color: var(--muted); cursor: pointer; font-size: 11px; transition: background .2s, color .2s; }
    .filter:hover { background: #f3f4ee; color: var(--ink); }
    .filter[aria-pressed="true"] { border-color: #e1e7dc; background: var(--green-soft); color: var(--green-deep); font-weight: 700; }
    .filter-count { display: inline-flex; min-width: 17px; height: 17px; align-items: center; justify-content: center; margin-left: 4px; border-radius: 5px; background: rgba(65,90,62,.08); font-size: 9px; }
    .list-divider { height: 1px; background: #eeefe9; }
    .task-list { padding: 0; margin: 0; list-style: none; }
    .task-item { display: flex; align-items: center; gap: 12px; min-height: 74px; padding: 13px 3px; border-bottom: 1px solid #f0f0ea; animation: appear .18s ease both; }
    .task-item:last-child { border-bottom: 0; }
    @keyframes appear { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
    .check-button { display: grid; place-items: center; flex: 0 0 21px; width: 21px; height: 21px; border: 1.5px solid #ccd4c7; border-radius: 7px; background: transparent; color: #fff; cursor: pointer; transition: all .18s; }
    .check-button:hover { border-color: var(--green); background: #f0f4ec; }
    .task-item.is-done .check-button { border-color: var(--green); background: var(--green); }
    .check-symbol { width: 12px; height: 12px; display: none; }
    .is-done .check-symbol { display: block; }
    .task-main { flex: 1; min-width: 0; }
    .task-title { overflow-wrap: anywhere; color: #2e352d; font-size: 12px; font-weight: 600; line-height: 1.6; }
    .is-done .task-title { color: #9a9f95; text-decoration: line-through; text-decoration-color: #bfc7b9; }
    .task-meta { display: flex; align-items: center; gap: 8px; margin-top: 5px; color: #9ba096; font-size: 10px; }
    .tag { display: inline-block; border-radius: 5px; padding: 2px 7px; background: #f0f1eb; color: #747e6e; font-size: 9px; }
    .tag.design { background: #f7ede3; color: #ad754a; }
    .tag.personal { background: #eaf0f6; color: #68839b; }
    .task-actions { opacity: .25; display: flex; gap: 4px; transition: opacity .18s; }
    .task-item:hover .task-actions, .task-actions:focus-within { opacity: 1; }
    .delete-button { display: grid; place-items: center; width: 30px; height: 30px; border: 0; border-radius: 8px; background: transparent; color: #778075; cursor: pointer; }
    .delete-button:hover { background: #f9eae5; color: #a94f3a; }
    .delete-button svg { width: 15px; height: 15px; }
    .empty-state { display: none; padding: 34px 15px 29px; text-align: center; }
    .empty-state.visible { display: block; }
    .empty-icon { display: grid; place-items: center; width: 43px; height: 43px; margin: 0 auto 12px; border-radius: 14px; background: #eff2e9; color: var(--green); font-size: 20px; }
    .empty-title { font-family: Georgia, serif; font-size: 17px; }
    .empty-copy { margin: 4px 0 0; color: var(--muted); font-size: 11px; }
    .list-footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 13px; padding-top: 13px; border-top: 1px solid #f0f0ea; color: #969d92; font-size: 10px; }
    .text-button { border: 0; padding: 4px 0; background: transparent; color: #778075; cursor: pointer; font-size: 10px; }
    .text-button:hover { color: #a94f3a; }
    .side-panel { padding: 21px; }
    .side-kicker { color: var(--muted); font-size: 9px; font-weight: 800; letter-spacing: 1.7px; text-transform: uppercase; }
    .quote-mark { margin-top: 15px; color: #b8c6af; font-family: Georgia, serif; font-size: 48px; line-height: .9; }
    .quote { margin: 5px 0 0; font-family: Georgia, "Yu Mincho", serif; font-size: 20px; line-height: 1.65; letter-spacing: -.4px; }
    .quote-foot { margin-top: 15px; color: var(--muted); font-size: 10px; }
    .side-divider { height: 1px; margin: 22px 0; background: var(--line); }
    .progress-heading { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 11px; font-weight: 700; }
    .progress-percent { color: var(--green); font-size: 12px; }
    .side-progress { height: 5px; overflow: hidden; margin-top: 11px; border-radius: 99px; background: #ebeee6; }
    .side-progress-fill { height: 100%; width: 0%; border-radius: inherit; background: var(--green); transition: width .25s ease; }
    .progress-caption { margin-top: 9px; color: var(--muted); font-size: 10px; }
    .tip { display: flex; gap: 11px; align-items: flex-start; padding: 13px; border: 1px solid #e5e9dd; border-radius: 12px; background: #f7f8f2; }
    .tip-icon { flex: 0 0 auto; color: #698060; font-size: 17px; }
    .tip-title { font-size: 11px; font-weight: 700; }
    .tip-copy { margin-top: 3px; color: var(--muted); font-size: 10px; line-height: 1.7; }
    .page-footer { display: flex; justify-content: space-between; gap: 16px; padding: 19px 0 0; color: #9aa095; font-size: 10px; }
    .footer-brand { color: #697565; font-family: Georgia, serif; font-size: 13px; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
    @media (max-width: 780px) {
      .workspace { grid-template-columns: 1fr; }
      .side-panel { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 18px; align-items: start; }
      .side-panel > .side-divider { display: none; }
      .tip { grid-column: 1 / -1; }
      .hero { align-items: flex-start; }
      .date-card { margin-top: 3px; }
    }
    @media (max-width: 520px) {
      .app-shell { width: min(100% - 28px, 1080px); }
      .topbar { height: 68px; }
      .topbar-right > span { display: none; }
      main { padding-top: 33px; }
      .hero { display: block; }
      h1 { font-size: 34px; }
      .date-card { display: inline-block; margin-top: 17px; padding: 9px 12px; text-align: left; }
      .stats { gap: 7px; }
      .stat { min-height: 94px; padding: 12px; border-radius: 13px; }
      .stat-number { font-size: 27px; }
      .stat-note { display: none; }
      .stat-label { font-size: 10px; }
      .task-panel { padding: 16px 13px; border-radius: 16px; }
      .panel-title { font-size: 20px; }
      .add-form { gap: 7px; padding-left: 9px; }
      .add-button { padding: 9px 10px; }
      .filters { gap: 1px; }
      .filter { padding: 7px 8px; font-size: 10px; }
      .task-item { gap: 9px; }
      .task-actions { opacity: .65; }
      .side-panel { display: block; padding: 17px; }
      .side-panel > .side-divider { display: block; margin: 18px 0; }
      .tip { margin-top: 19px; }
      .page-footer { flex-direction: column; gap: 3px; }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
    }
  </style>
</head>
<body>
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="/" aria-label="mori ホーム">
        <span class="brand-mark" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 20.2V10.6M12 14.2C7.5 14.2 5 11.5 5 7.2c4.8 0 7 2.4 7 7ZM12 10.7c0-4.2 2.5-6.9 7-6.9 0 4.6-2.4 6.9-7 6.9Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
        <span><span class="brand-name">mori</span><span class="brand-sub">a little task garden</span></span>
      </a>
      <div class="topbar-right"><span>小さな一歩を、大切に。</span><span class="avatar" aria-label="ゲスト">m</span></div>
    </header>

    <main>
      <section class="hero" aria-labelledby="page-title">
        <div>
          <div class="eyebrow"><span class="eyebrow-dot"></span> YOUR PERSONAL SPACE</div>
          <h1 id="page-title">今日を、少し軽く。</h1>
          <p class="hero-copy">やることを並べて、ひとつずつ。<br>完璧じゃなくても、前に進めば大丈夫。</p>
        </div>
        <div class="date-card">
          <div class="date-label">TODAY'S DATE</div>
          <div class="date-value" id="today-date">今日</div>
        </div>
      </section>

      <section class="stats" aria-label="タスクの概要">
        <article class="stat"><div class="stat-label">すべてのタスク</div><div class="stat-number" id="stat-total">03</div><div class="stat-note">YOUR LIST</div></article>
        <article class="stat"><div class="stat-label">完了したタスク</div><div class="stat-number" id="stat-done">01</div><div class="stat-note">WELL DONE</div></article>
        <article class="stat stat-accent">
          <div class="stat-label">あと少し！</div><div class="stat-number" id="stat-left">02</div><div class="stat-note">KEEP GOING</div>
          <div class="progress-line"><div class="progress-fill" id="top-progress"></div></div>
        </article>
      </section>

      <div class="workspace">
        <section class="task-panel" aria-labelledby="list-title">
          <div class="panel-head">
            <div><h2 class="panel-title" id="list-title">今日のタスク</h2><p class="panel-subtitle">自分のペースで進めていこう。</p></div>
            <span class="today-badge" id="list-badge">MY DAILY LIST</span>
          </div>

          <form class="add-form" id="add-form">
            <span class="plus" aria-hidden="true">+</span>
            <label class="sr-only" for="new-task">新しいタスク</label>
            <input class="add-input" id="new-task" name="task" type="text" maxlength="120" autocomplete="off" placeholder="新しいタスクを入力…" required>
            <button class="add-button" type="submit">追加する ↗</button>
          </form>

          <div class="filters" role="group" aria-label="表示するタスク">
            <button class="filter" type="button" data-filter="all" aria-pressed="true">すべて <span class="filter-count" id="count-all">3</span></button>
            <button class="filter" type="button" data-filter="active" aria-pressed="false">未完了 <span class="filter-count" id="count-active">2</span></button>
            <button class="filter" type="button" data-filter="done" aria-pressed="false">完了済み <span class="filter-count" id="count-done">1</span></button>
          </div>
          <div class="list-divider"></div>
          <ul class="task-list" id="task-list" aria-live="polite" aria-label="タスク一覧"></ul>
          <div class="empty-state" id="empty-state">
            <div class="empty-icon" aria-hidden="true">✳</div>
            <div class="empty-title" id="empty-title">ここはまだ、まっさら。</div>
            <p class="empty-copy" id="empty-copy">思いついたことを、ひとつ追加してみよう。</p>
          </div>
          <div class="list-footer"><span id="list-summary">3つのタスクを管理中</span><button type="button" class="text-button" id="clear-done">完了済みを整理する</button></div>
        </section>

        <aside class="side-panel" aria-label="今日のヒント">
          <div>
            <div class="side-kicker">A gentle reminder</div>
            <div class="quote-mark" aria-hidden="true">“</div>
            <p class="quote">小さく始めることは、何もしないことよりずっといい。</p>
            <div class="quote-foot">今日の自分に、やさしく。</div>
          </div>
          <div class="side-divider"></div>
          <div>
            <div class="progress-heading"><span>今日の進み具合</span><span class="progress-percent" id="progress-percent">33%</span></div>
            <div class="side-progress"><div class="side-progress-fill" id="side-progress"></div></div>
            <div class="progress-caption" id="progress-caption">3つのうち、1つ完了。</div>
          </div>
          <div class="tip">
            <span class="tip-icon" aria-hidden="true">✺</span>
            <div><div class="tip-title">ちいさなヒント</div><div class="tip-copy">大きなタスクは、5分でできることに分けてみよう。最初の一歩が見つかりやすくなるよ。</div></div>
          </div>
        </aside>
      </div>
      <footer class="page-footer"><span class="footer-brand">mori <span style="font-family:inherit;font-size:10px;color:#9aa095">— grow at your own pace</span></span><span>タスクはこのブラウザーに保存されます。</span></footer>
    </main>
  </div>

  <script>
    (function () {
      'use strict';
      var tasks = [];
      var filter = 'all';
      var list = document.getElementById('task-list');
      var empty = document.getElementById('empty-state');
      var input = document.getElementById('new-task');
      var form = document.getElementById('add-form');
      var summary = document.getElementById('list-summary');

      document.getElementById('today-date').textContent = new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
      }).format(new Date());

      function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
          return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
        });
      }

      async function requestApi(path, method, payload) {
        var options = { method: method || 'GET', headers: { 'Accept': 'application/json' } };
        if (payload !== undefined) {
          options.headers['Content-Type'] = 'application/json';
          options.body = JSON.stringify(payload);
        }

        var response = await fetch(path, options);
        var result = {};
        try {
          if (response.status !== 204) result = await response.json();
        } catch (error) {
          result = {};
        }
        if (!response.ok) {
          throw new Error(result && result.error ? result.error : '保存に失敗しました。もう一度お試しください。');
        }
        return result;
      }

      function progressText(total, done) {
        if (total === 0) return 'まずは1つ、追加してみよう。';
        if (done === total) return 'すべて完了！よくできました。';
        return total + 'つのうち、' + done + 'つ完了。';
      }

      function taskMarkup(task) {
        var doneClass = task.done ? ' is-done' : '';
        var tagKind = task.kind === 'design' ? ' design' : (task.kind === 'personal' ? ' personal' : '');
        var toggleLabel = task.done ? '「' + task.title + '」を未完了に戻す' : '「' + task.title + '」を完了にする';
        return '<li class="task-item' + doneClass + '" data-id="' + escapeHtml(task.id) + '">' +
          '<button class="check-button" type="button" data-action="toggle" aria-label="' + escapeHtml(toggleLabel) + '" aria-pressed="' + String(task.done) + '">' +
          '<svg class="check-symbol" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 8 3.2 3.2L13 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
          '<div class="task-main"><div class="task-title">' + escapeHtml(task.title) + '</div><div class="task-meta"><span class="tag' + tagKind + '">' + escapeHtml(task.tag || 'タスク') + '</span><span>' + (task.done ? '完了しました' : '今日のタスク') + '</span></div></div>' +
          '<div class="task-actions"><button class="delete-button" type="button" data-action="delete" aria-label="「' + escapeHtml(task.title) + '」を削除">' +
          '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13M10 11v5m4-5v5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div></li>';
      }

      function render() {
        var total = tasks.length;
        var doneCount = tasks.filter(function (task) { return task.done; }).length;
        var activeCount = total - doneCount;
        var percent = total === 0 ? 0 : Math.round(doneCount / total * 100);
        var visible = tasks.filter(function (task) {
          if (filter === 'active') return !task.done;
          if (filter === 'done') return task.done;
          return true;
        });

        document.getElementById('stat-total').textContent = String(total).padStart(2, '0');
        document.getElementById('stat-done').textContent = String(doneCount).padStart(2, '0');
        document.getElementById('stat-left').textContent = String(activeCount).padStart(2, '0');
        document.getElementById('top-progress').style.width = percent + '%';
        document.getElementById('side-progress').style.width = percent + '%';
        document.getElementById('progress-percent').textContent = percent + '%';
        document.getElementById('progress-caption').textContent = progressText(total, doneCount);
        document.getElementById('count-all').textContent = total;
        document.getElementById('count-active').textContent = activeCount;
        document.getElementById('count-done').textContent = doneCount;
        document.getElementById('list-summary').textContent = total + 'つのタスクを管理中';
        document.getElementById('clear-done').hidden = doneCount === 0;

        document.querySelectorAll('[data-filter]').forEach(function (button) {
          button.setAttribute('aria-pressed', String(button.getAttribute('data-filter') === filter));
        });

        list.innerHTML = visible.map(taskMarkup).join('');
        empty.classList.toggle('visible', visible.length === 0);
        list.hidden = visible.length === 0;

        if (visible.length === 0 && total === 0) {
          document.getElementById('empty-title').textContent = 'ここはまだ、まっさら。';
          document.getElementById('empty-copy').textContent = '思いついたことを、ひとつ追加してみよう。';
        } else if (visible.length === 0 && filter === 'active') {
          document.getElementById('empty-title').textContent = 'すべて片づいたね！';
          document.getElementById('empty-copy').textContent = '今日は少し、ゆっくりしてもいいかも。';
        } else if (visible.length === 0) {
          document.getElementById('empty-title').textContent = '完了したタスクはまだないよ。';
          document.getElementById('empty-copy').textContent = 'ひとつずつ進めていこう。';
        }
      }

      async function refreshTasks() {
        tasks = await requestApi('/api/tasks');
        render();
      }

      function showError(error) {
        summary.textContent = error && error.message ? error.message : 'エラーが発生しました。';
      }

      form.addEventListener('submit', async function (event) {
        event.preventDefault();
        var title = input.value.trim();
        if (!title) {
          input.focus();
          return;
        }
        try {
          await requestApi('/api/tasks', 'POST', { title: title });
          filter = 'all';
          input.value = '';
          await refreshTasks();
          input.focus();
        } catch (error) {
          showError(error);
        }
      });

      list.addEventListener('click', async function (event) {
        var button = event.target.closest('button[data-action]');
        if (!button) return;
        var item = button.closest('[data-id]');
        if (!item) return;
        var id = item.getAttribute('data-id');
        try {
          if (button.getAttribute('data-action') === 'toggle') {
            await requestApi('/api/tasks/' + encodeURIComponent(id) + '/toggle', 'POST');
          } else if (button.getAttribute('data-action') === 'delete') {
            await requestApi('/api/tasks/' + encodeURIComponent(id) + '/delete', 'POST');
          }
          await refreshTasks();
        } catch (error) {
          showError(error);
        }
      });

      document.querySelectorAll('[data-filter]').forEach(function (button) {
        button.addEventListener('click', function () {
          filter = button.getAttribute('data-filter');
          render();
        });
      });

      document.getElementById('clear-done').addEventListener('click', async function () {
        try {
          await requestApi('/api/tasks/clear-completed', 'POST');
          await refreshTasks();
        } catch (error) {
          showError(error);
        }
      });

      refreshTasks().catch(showError);
    })();
  </script>
</body>
</html>`;

export function renderHomePage(): Response {
  return new Response(documentHtml, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
