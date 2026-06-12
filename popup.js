const DEFAULT_SELECTOR = ".chat-turn-container.code-block-aligner.model.render.ng-star-inserted";

document.addEventListener('DOMContentLoaded', async () => {
  const toggleExtension = document.getElementById('toggleExtension');
  const preserveCodeToggle = document.getElementById('preserveCode');
  const rtlUserPromptsToggle = document.getElementById('rtlUserPrompts');
  const rtlUserInputToggle = document.getElementById('rtlUserInput');

  const selectorInput = document.getElementById('selectorInput');
  const addSelectorBtn = document.getElementById('addSelector');
  const selectorsList = document.getElementById('selectorsList');
  const selectAllBtn = document.getElementById('selectAll');
  const forceApplyBtn = document.getElementById('forceApply');

  const fontEnabledToggle = document.getElementById('fontEnabled');
  const textControls = document.getElementById('textControls');
  const textFontInput = document.getElementById('textFontInput');
  const decTextSizeBtn = document.getElementById('decTextSize');
  const incTextSizeBtn = document.getElementById('incTextSize');
  const textSizeVal = document.getElementById('textSizeVal');
  const resetTextFontBtn = document.getElementById('resetTextFont');

  const codeFontEnabledToggle = document.getElementById('codeFontEnabled');
  const codeControls = document.getElementById('codeControls');
  const codeFontInput = document.getElementById('codeFontInput');
  const decCodeSizeBtn = document.getElementById('decCodeSize');
  const incCodeSizeBtn = document.getElementById('incCodeSize');
  const codeSizeVal = document.getElementById('codeSizeVal');
  const resetCodeFontBtn = document.getElementById('resetCodeFont');

  const fontListDatalist = document.getElementById('fontList');

  let data = await chrome.storage.local.get([
    'enabled', 'selectors', 'preserveCode', 'rtlUserPrompts', 'rtlUserInput',
    'fontEnabled', 'textFont', 'textFontSize',
    'codeFontEnabled', 'codeFont', 'codeFontSize'
  ]);

  let enabled = data.enabled !== undefined ? data.enabled : true;
  let preserveCode = data.preserveCode !== undefined ? data.preserveCode : true;
  let rtlUserPrompts = data.rtlUserPrompts !== undefined ? data.rtlUserPrompts : true;
  let rtlUserInput = data.rtlUserInput !== undefined ? data.rtlUserInput : false;
  let selectors = data.selectors || [{ text: DEFAULT_SELECTOR, active: true, isDefault: true }];

  let fontEnabled = data.fontEnabled !== undefined ? data.fontEnabled : false;
  let textFont = data.textFont || 'Vazirmatn';
  let textFontSize = data.textFontSize || 14;

  let codeFontEnabled = data.codeFontEnabled !== undefined ? data.codeFontEnabled : false;
  let codeFont = data.codeFont || 'monospace';
  let codeFontSize = data.codeFontSize || 13;

  toggleExtension.checked = enabled;
  preserveCodeToggle.checked = preserveCode;
  rtlUserPromptsToggle.checked = rtlUserPrompts;
  rtlUserInputToggle.checked = rtlUserInput;

  fontEnabledToggle.checked = fontEnabled;
  textFontInput.value = textFont;
  textSizeVal.textContent = `${textFontSize}px`;
  textControls.style.display = fontEnabled ? 'flex' : 'none';

  codeFontEnabledToggle.checked = codeFontEnabled;
  codeFontInput.value = codeFont;
  codeSizeVal.textContent = `${codeFontSize}px`;
  codeControls.style.display = codeFontEnabled ? 'flex' : 'none';

  renderSelectors(selectors);

  if (chrome.fontSettings && chrome.fontSettings.getFontList) {
    chrome.fontSettings.getFontList((fonts) => {
      fontListDatalist.innerHTML = '<option value="Vazirmatn">Vazirmatn (Google Font)</option>';
      fonts.forEach((font) => {
        const option = document.createElement('option');
        option.value = font.fontId;
        option.textContent = font.displayName;
        fontListDatalist.appendChild(option);
      });
    });
  }

  textFontInput.addEventListener('focus', function () {
    this.select();
  });
  textFontInput.addEventListener('blur', function () {
    if (!this.value.trim()) {
      this.value = textFont;
    }
  });

  codeFontInput.addEventListener('focus', function () {
    this.select();
  });
  codeFontInput.addEventListener('blur', function () {
    if (!this.value.trim()) {
      this.value = codeFont;
    }
  });

  async function saveState() {
    await chrome.storage.local.set({
      enabled, selectors, preserveCode, rtlUserPrompts, rtlUserInput,
      fontEnabled, textFont, textFontSize,
      codeFontEnabled, codeFont, codeFontSize
    });
  }

  function renderSelectors(list) {
    selectorsList.innerHTML = '';
    list.forEach((sel, index) => {
      const item = document.createElement('div');
      item.className = 'selector-item';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = sel.active;
      checkbox.addEventListener('change', () => {
        list[index].active = checkbox.checked;
        saveState();
      });

      const label = document.createElement('span');
      label.className = 'selector-text';
      label.textContent = sel.text;
      label.title = sel.text;

      item.appendChild(checkbox);
      item.appendChild(label);

      if (!sel.isDefault) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '✕';
        deleteBtn.addEventListener('click', () => {
          selectors.splice(index, 1);
          saveState();
          renderSelectors(selectors);
        });
        item.appendChild(deleteBtn);
      } else {
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = 'Default';
        item.appendChild(badge);
      }

      selectorsList.appendChild(item);
    });
  }

  toggleExtension.addEventListener('change', () => {
    enabled = toggleExtension.checked;
    saveState();
  });

  preserveCodeToggle.addEventListener('change', () => {
    preserveCode = preserveCodeToggle.checked;
    saveState();
  });

  rtlUserPromptsToggle.addEventListener('change', () => {
    rtlUserPrompts = rtlUserPromptsToggle.checked;
    saveState();
  });

  rtlUserInputToggle.addEventListener('change', () => {
    rtlUserInput = rtlUserInputToggle.checked;
    saveState();
  });

  fontEnabledToggle.addEventListener('change', () => {
    fontEnabled = fontEnabledToggle.checked;
    textControls.style.display = fontEnabled ? 'flex' : 'none';
    saveState();
  });

  textFontInput.addEventListener('change', () => {
    const val = textFontInput.value.trim();
    if (val) {
      textFont = val;
      saveState();
    }
  });

  decTextSizeBtn.addEventListener('click', () => {
    if (textFontSize > 8) {
      textFontSize--;
      textSizeVal.textContent = `${textFontSize}px`;
      saveState();
    }
  });

  incTextSizeBtn.addEventListener('click', () => {
    if (textFontSize < 48) {
      textFontSize++;
      textSizeVal.textContent = `${textFontSize}px`;
      saveState();
    }
  });

  resetTextFontBtn.addEventListener('click', () => {
    fontEnabled = false;
    textFont = 'Vazirmatn';
    textFontSize = 14;

    fontEnabledToggle.checked = false;
    textControls.style.display = 'none';
    textFontInput.value = 'Vazirmatn';
    textSizeVal.textContent = '14px';
    saveState();
  });

  codeFontEnabledToggle.addEventListener('change', () => {
    codeFontEnabled = codeFontEnabledToggle.checked;
    codeControls.style.display = codeFontEnabled ? 'flex' : 'none';
    saveState();
  });

  codeFontInput.addEventListener('change', () => {
    const val = codeFontInput.value.trim();
    if (val) {
      codeFont = val;
      saveState();
    }
  });

  decCodeSizeBtn.addEventListener('click', () => {
    if (codeFontSize > 8) {
      codeFontSize--;
      codeSizeVal.textContent = `${codeFontSize}px`;
      saveState();
    }
  });

  incCodeSizeBtn.addEventListener('click', () => {
    if (codeFontSize < 48) {
      codeFontSize++;
      codeSizeVal.textContent = `${codeFontSize}px`;
      saveState();
    }
  });

  resetCodeFontBtn.addEventListener('click', () => {
    codeFontEnabled = false;
    codeFont = 'monospace';
    codeFontSize = 13;

    codeFontEnabledToggle.checked = false;
    codeControls.style.display = 'none';
    codeFontInput.value = 'monospace';
    codeSizeVal.textContent = '13px';
    saveState();
  });

  addSelectorBtn.addEventListener('click', () => {
    const value = selectorInput.value.trim();
    if (value) {
      if (!selectors.some(s => s.text === value)) {
        selectors.push({ text: value, active: true, isDefault: false });
        saveState();
        renderSelectors(selectors);
        selectorInput.value = '';
      }
    }
  });

  selectAllBtn.addEventListener('click', () => {
    const allChecked = selectors.every(s => s.active);
    selectors.forEach(s => s.active = !allChecked);
    saveState();
    renderSelectors(selectors);
  });

  forceApplyBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    const activeSelectors = selectors.filter(s => s.active).map(s => s.text);

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (isExtEnabled, selList, keepCodeLtr, applyRtlPrompts, applyRtlInput, fEnabled, tFont, tFontSize, cEnabled, cFont, cFontSize) => {
        const autoStyle = document.getElementById('rtl-ext-style');
        if (autoStyle) autoStyle.remove();
        const autoFont = document.getElementById('rtl-ext-google-font');
        if (autoFont) autoFont.remove();

        const needsGoogleFont = isExtEnabled && ((fEnabled && tFont === 'Vazirmatn') || (cEnabled && cFont === 'Vazirmatn'));
        let fontLink = document.getElementById('rtl-ext-google-font-force');
        if (needsGoogleFont) {
          if (!fontLink) {
            fontLink = document.createElement('link');
            fontLink.id = 'rtl-ext-google-font-force';
            fontLink.rel = 'stylesheet';
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700&display=swap';
            document.head.appendChild(fontLink);
          }
        } else {
          if (fontLink) fontLink.remove();
        }

        let styleEl = document.getElementById('rtl-ext-style-force');
        if (!styleEl) {
          styleEl = document.createElement('style');
          styleEl.id = 'rtl-ext-style-force';
          document.head.appendChild(styleEl);
        }

        if (!isExtEnabled) {
          styleEl.textContent = '';
          return;
        }

        let cssRules = '';

        cssRules += selList.map(sel => {
          let rule = `${sel} { direction: rtl !important; }`;
          if (keepCodeLtr) {
            rule += `\n${sel} code, ${sel} pre, ${sel} .code-block { direction: ltr !important; text-align: left !important; }`;
          } else {
            rule += `\n${sel} code, ${sel} pre, ${sel} .code-block { direction: rtl !important; text-align: right !important; }`;
          }
          return rule;
        }).join('\n');

        if (applyRtlPrompts) {
          const promptSelector = '.chat-turn-container.code-block-aligner.render.user.ng-star-inserted p.ng-star-inserted';
          cssRules += `\n${promptSelector} { direction: rtl !important; }`;
          if (keepCodeLtr) {
            cssRules += `\n${promptSelector} code, ${promptSelector} pre { direction: ltr !important; text-align: left !important; }`;
          } else {
            cssRules += `\n${promptSelector} code, ${promptSelector} pre { direction: rtl !important; text-align: right !important; }`;
          }
        }

        if (applyRtlInput) {
          const inputSelector = '.prompt-box-container textarea';
          cssRules += `\n${inputSelector} { direction: rtl !important; }`;
        }

        const iconExclusions = ':not(mat-icon):not(.mat-icon):not(i):not([class*="material-icons"]):not([class*="material-symbols"])';

        if (fEnabled) {
          const textTargets = [
            '.chat-turn-container.code-block-aligner.render.user.ng-star-inserted',
            '.chat-turn-container.code-block-aligner.model.render.ng-star-inserted',
            '.prompt-box-container textarea',
            '.chat-turn-container.code-block-aligner.render.user.ng-star-inserted *:not(pre):not(code):not(ms-code-block):not(pre *):not(code *):not(ms-code-block *):not(mat-icon):not(.mat-icon):not(i):not([class*="material-icons"]):not([class*="material-symbols"])',
            '.chat-turn-container.code-block-aligner.model.render.ng-star-inserted *:not(pre):not(code):not(ms-code-block):not(pre *):not(code *):not(ms-code-block *):not(mat-icon):not(.mat-icon):not(i):not([class*="material-icons"]):not([class*="material-symbols"])'
          ].join(', ');
          cssRules += `\n${textTargets} { font-family: "${tFont}", sans-serif !important; font-size: ${tFontSize}px !important; }`;
        }

        if (cEnabled) {
          const codeTargets = [
            'ms-code-block',
            `ms-code-block *${iconExclusions}`,
            '.chat-turn-container pre',
            '.chat-turn-container code',
            `.chat-turn-container pre *${iconExclusions}`,
            `.chat-turn-container code *${iconExclusions}`
          ].join(', ');
          cssRules += `\n${codeTargets} { font-family: "${cFont}", monospace !important; font-size: ${cFontSize}px !important; }`;
        } else {
          if (fEnabled) {
            const codeTargets = [
              'ms-code-block',
              `ms-code-block *${iconExclusions}`,
              '.chat-turn-container pre',
              '.chat-turn-container code',
              `.chat-turn-container pre *${iconExclusions}`,
              `.chat-turn-container code *${iconExclusions}`
            ].join(', ');
            cssRules += `\n${codeTargets} { font-family: monospace !important; }`;
          }
        }

        styleEl.textContent = cssRules;
      },
      args: [
        enabled, activeSelectors, preserveCode, rtlUserPrompts, rtlUserInput,
        fontEnabled, textFont, textFontSize,
        codeFontEnabled, codeFont, codeFontSize
      ]
    });
  });
});