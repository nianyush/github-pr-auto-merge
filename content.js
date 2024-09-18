(function () {
    let autoMergeInterval = null;

    function updateBaseBranch() {
        const updateButton = document.querySelector('.btn-group-update-merge');
        if (updateButton) {
            updateButton.click();
            console.log('Base branch updated');
        } else {
            console.log('Update branch button not found');
        }
    }

    function mergePR() {
        const mergeButton = document.querySelector('.merge-box-button');
        if (mergeButton) {
            if (!mergeButton.disabled) {
                mergeButton.click();
                console.log('PR merged via squash and merge');
            } else {
                console.log('Merge button is currently disabled');
            }
        } else {
            console.log('Squash and merge button not found');
        }
    }

    function startAutoMerge() {
        if (!autoMergeInterval) {
            autoMergeInterval = setInterval(() => {
                updateBaseBranch();
                mergePR();
            }, 10000);
            console.log('Auto merge started');
        }
    }

    function stopAutoMerge() {
        if (autoMergeInterval) {
            clearInterval(autoMergeInterval);
            autoMergeInterval = null;
            console.log('Auto merge stopped');
        }
    }

    // Listen for messages from popup.js
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'start') {
            startAutoMerge();
        } else if (request.action === 'stop') {
            stopAutoMerge();
        }
    });
})();
