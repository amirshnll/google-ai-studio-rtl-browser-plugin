find . -type f -name ".DS_Store" -delete
cd chrome
zip -r chrome.zip . --exclude ".git/*" --exclude "release.sh" --exclude .DS_Store
mv chrome.zip ~/Downloads/google-ai-rtl-chrome.zip
