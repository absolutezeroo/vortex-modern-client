let registry = null;
let currentIndex = 0;
let sourceFolder = '';
let stepDone = [];
let eventSource = null;

const stepperEl = document.getElementById('stepper');
const stepBodyEl = document.getElementById('step-body');
const browserTemplate = document.getElementById('browser-template');

async function main()
{
    const res = await fetch('/api/registry');

    registry = await res.json();
    stepDone = registry.installSteps.map(() => false);
    renderAll();
}

function findTool(id)
{
    return registry.tools.find((t) => t.id === id);
}

function renderAll()
{
    renderStepper();
    renderStepBody();
}

function renderStepper()
{
    stepperEl.innerHTML = '';

    registry.installSteps.forEach((step, index) =>
    {
        const li = document.createElement('li');

        li.className = 'stepper-item';
        if(index === currentIndex) li.classList.add('active');
        if(stepDone[index]) li.classList.add('done');

        li.innerHTML = `<span class="dot">${index + 1}</span><span class="label">${step.title}</span>`;
        stepperEl.appendChild(li);
    });
}

function joinPath(base, parts)
{
    return [base.replace(/[\\/]+$/, ''), ...parts].join('/');
}

function renderStepBody()
{
    stepBodyEl.innerHTML = '';

    const step = registry.installSteps[currentIndex];

    if(currentIndex >= registry.installSteps.length)
    {
        stepBodyEl.appendChild(buildFinishedPanel());
        return;
    }

    if(step.kind === 'source-folder') stepBodyEl.appendChild(buildSourceFolderPanel(step));
    else stepBodyEl.appendChild(buildRunToolPanel(step));
}

function buildFinishedPanel()
{
    const panel = document.createElement('section');

    panel.className = 'panel';
    panel.innerHTML = `
        <h2>Installation terminee</h2>
        <p class="hint">Tous les assets sont en place. Tu peux maintenant lancer <code>pnpm dev</code>.</p>
    `;

    const restart = document.createElement('button');

    restart.className = 'secondary';
    restart.textContent = 'Recommencer';
    restart.addEventListener('click', restartInstall);
    panel.appendChild(restart);

    return panel;
}

function restartInstall()
{
    currentIndex = 0;
    sourceFolder = '';
    stepDone = registry.installSteps.map(() => false);
    renderAll();
}

function buildSourceFolderPanel(step)
{
    const panel = document.createElement('section');

    panel.className = 'panel';
    panel.innerHTML = `<h2>${step.title}</h2><p class="hint">${step.description}</p>`;

    const status = document.createElement('div');

    status.className = 'validation-status';

    const nav = document.createElement('div');

    nav.className = 'wizard-nav';

    const nextButton = document.createElement('button');

    nextButton.textContent = 'Suivant';
    nextButton.disabled = !stepDone[currentIndex];
    nextButton.addEventListener('click', () => goToStep(currentIndex + 1));
    nav.appendChild(nextButton);

    const browser = buildFolderBrowser(sourceFolder, async (chosenPath) =>
    {
        sourceFolder = chosenPath;
        status.textContent = 'Verification...';
        status.className = 'validation-status';

        const res = await fetch(`/api/validate-source?dir=${encodeURIComponent(chosenPath)}`);
        const data = await res.json();

        stepDone[currentIndex] = data.valid;
        status.textContent = data.message;
        status.className = 'validation-status ' + (data.valid ? 'ok' : 'error');
        nextButton.disabled = !data.valid;
    });

    panel.appendChild(browser);
    panel.appendChild(status);
    panel.appendChild(nav);

    return panel;
}

function buildRunToolPanel(step)
{
    const tool = findTool(step.toolId);
    const panel = document.createElement('section');

    panel.className = 'panel';
    panel.innerHTML = `<h2>${step.title}</h2><p class="hint">${step.description}</p>`;

    const logOutput = document.createElement('pre');

    logOutput.className = 'log-output';

    const runButton = document.createElement('button');

    runButton.textContent = stepDone[currentIndex] ? 'Relancer cette etape' : 'Lancer cette etape';

    const nav = document.createElement('div');

    nav.className = 'wizard-nav';

    const backButton = document.createElement('button');

    backButton.className = 'secondary';
    backButton.textContent = 'Retour';
    backButton.disabled = currentIndex === 0;
    backButton.addEventListener('click', () => goToStep(currentIndex - 1));

    const nextButton = document.createElement('button');

    nextButton.textContent = 'Suivant';
    nextButton.disabled = !stepDone[currentIndex];
    nextButton.addEventListener('click', () => goToStep(currentIndex + 1));

    runButton.addEventListener('click', () => runStep(step, tool, logOutput, runButton, nextButton));

    nav.appendChild(backButton);
    nav.appendChild(runButton);
    nav.appendChild(nextButton);

    panel.appendChild(logOutput);
    panel.appendChild(nav);

    return panel;
}

function buildStepParams(step)
{
    const params = new URLSearchParams();

    params.set('id', step.toolId);

    if(step.sourceFolderOptionKey)
    {
        const value = step.sourceFolderSubpath ? joinPath(sourceFolder, step.sourceFolderSubpath) : sourceFolder;

        params.set(step.sourceFolderOptionKey, value);
    }

    for(const [key, value] of Object.entries(step.overrides ?? {})) params.set(key, String(value));

    return params;
}

function appendLog(logOutput, text, className)
{
    const line = document.createElement('div');

    line.className = 'log-line' + (className ? ' ' + className : '');
    line.textContent = text;
    logOutput.appendChild(line);
    logOutput.scrollTop = logOutput.scrollHeight;
}

function runStep(step, tool, logOutput, runButton, nextButton)
{
    logOutput.innerHTML = '';
    runButton.disabled = true;
    nextButton.disabled = true;

    let failed = false;
    const params = buildStepParams(step);

    eventSource = new EventSource(`/api/run/tool?${params.toString()}`);

    eventSource.addEventListener('log', (e) => appendLog(logOutput, e.data));
    eventSource.addEventListener('fatal', (e) =>
    {
        failed = true;
        appendLog(logOutput, e.data, 'fatal');
    });
    eventSource.addEventListener('done', () =>
    {
        eventSource.close();
        runButton.disabled = false;
        runButton.textContent = 'Relancer cette etape';

        if(!failed)
        {
            stepDone[currentIndex] = true;
            appendLog(logOutput, '-- etape terminee --', 'done');
            nextButton.disabled = false;
            renderStepper();
        }
    });

    eventSource.onerror = () =>
    {
        eventSource.close();
        runButton.disabled = false;
    };
}

function buildFolderBrowser(initialPath, onPick)
{
    const panel = browserTemplate.content.firstElementChild.cloneNode(true);
    const pathEl = panel.querySelector('.browser-path');
    const errorEl = panel.querySelector('.browser-error');
    const listEl = panel.querySelector('.browser-list');
    const pickButton = panel.querySelector('.browser-pick');

    let currentDir = initialPath;

    async function load(dir)
    {
        const res = await fetch(`/api/browse?dir=${encodeURIComponent(dir)}`);
        const data = await res.json();

        currentDir = data.path;
        pathEl.textContent = data.path;
        errorEl.textContent = data.error ? `Dossier illisible ou inexistant: ${data.error}` : '';
        listEl.innerHTML = '';

        if(data.parent)
        {
            const up = document.createElement('button');

            up.className = 'browser-entry browser-up';
            up.textContent = '.. (dossier parent)';
            up.addEventListener('click', () => load(data.parent));
            listEl.appendChild(up);
        }

        for(const entry of data.entries)
        {
            const btn = document.createElement('button');

            btn.className = 'browser-entry';
            btn.textContent = entry.name;
            btn.addEventListener('click', () => load(entry.path));
            listEl.appendChild(btn);
        }
    }

    pickButton.addEventListener('click', () => onPick(currentDir));

    load(currentDir);

    return panel;
}

function goToStep(index)
{
    currentIndex = index;
    renderAll();
}

main();
