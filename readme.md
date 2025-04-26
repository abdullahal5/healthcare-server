<h1>📦 PH HealthCare Server</h1>

<p>
  Welcome to the <strong>backend repository</strong> for <strong>PH HealthCare</strong>, a tutorial project developed as part of the <strong>Level 2 Web Development Course</strong> offered by <strong>Programming Hero</strong>.
</p>

<p>
  This repository contains the backend codebase responsible for:
</p>

<ul>
  <li>Handling server-side logic</li>
  <li>Managing the database</li>
  <li>Enabling communication between different system components</li>
</ul>

<hr>

<h2>🚀 Installation and Setup</h2>

<ol>
  <li><strong>Clone the repository</strong>
    <pre><code>git clone https://github.com/Apollo-Level2-Web-Dev/b3-ph-health-care.git</code></pre>
  </li>

  <li><strong>Navigate to the project directory</strong>
    <pre><code>cd healthcare-server</code></pre>
  </li>

  <li><strong>Install the dependencies</strong>
    <pre><code>npm install</code></pre>
  </li>

  <li><strong>Set up environment variables</strong>
    <ul>
      <li>Create a <code>.env</code> file in the root directory.</li>
      <li>Copy and fill in the following fields:</li>
    </ul>
  </li>
</ol>

<h3>🔑 Environment Variables</h3>

<pre><code>NODE_ENV="development"
PORT=3000
DATABASE_URL=
JWT_SECRET="ksfljkdsjflksdjflk"
EXPIRES_IN="30d"
REFRESH_TOKEN_SECRET="skdslfjiskfjsdf"
REFRESH_TOKEN_EXPIRES_IN="30d"
RESET_PASS_TOKEN="1244444444kkkkk"
RESET_PASS_TOKEN_EXPIRES_IN="5m"
RESET_PASS_LINK="FRONT-END RESET PASS LINK"
EMAIL="YOUR EMAIL"
APP_PASS="APP PASS"
</code></pre>

<ol start="5">
  <li><strong>Run database migrations</strong>
    <pre><code>npx prisma migrate dev</code></pre>
  </li>

  <li><strong>Start the development server</strong>
    <pre><code>npm run dev</code></pre>
  </li>
</ol>

<hr>
