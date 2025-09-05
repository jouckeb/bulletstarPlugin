function autoTikkie() {
    const tikkieRadioButton = document.getElementById(TIKKIE),
        submitButtons = document.querySelectorAll('input[type=submit]');

    if (tikkieRadioButton === null || tikkieRadioButton === 'undefined') {
        return;
    }

    tikkieRadioButton.checked = true;
    submitButtons[0].click();

    console.log('tikkie');
}

function autoKeld() {
    const tikkieRadioButton = document.getElementById(KELD),
        submitButtons = document.querySelectorAll('input[type=submit]');

    if (tikkieRadioButton === null || tikkieRadioButton === 'undefined') {
        return;
    }

    tikkieRadioButton.checked = true;
    submitButtons[0].click();

    console.log('keld');
}

function autoMoord() {
    const tikkieRadioButton = document.getElementById(MOORD),
        submitButtons = document.querySelectorAll('input[type=submit]');

    if (tikkieRadioButton === null || tikkieRadioButton === 'undefined') {
        return;
    }

    tikkieRadioButton.checked = true;
    submitButtons[0].click();

    console.log('moord');
}
