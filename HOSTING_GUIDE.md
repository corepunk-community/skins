# Hosting Guide: Skin Viewer on GitHub Pages

This guide will help you host your Skin Viewer application on GitHub Pages for free.

## Prerequisites

- A GitHub account
- Git installed on your computer
- Your skin_tags.json file and Sprite folder with images

## Step 1: Create a GitHub Repository

1. Log in to your GitHub account
2. Click on the "+" icon in the top right corner and select "New repository"
3. Name your repository (e.g., "skin-viewer")
4. Optionally add a description
5. Keep it public (GitHub Pages requires a public repository unless you have a paid account)
6. Click "Create repository"

## Step 2: Prepare Your Local Files

Make sure you have all these files in a local folder:
- index.html
- styles.css
- script.js
- skin_tags.json 
- Sprite/ folder with all your skin images

## Step 3: Initialize and Push to GitHub

Open a terminal in your project folder and run the following commands:

```bash
# Initialize a new git repository
git init

# Add all files
git add .

# Commit the files
git commit -m "Initial commit"

# Add the remote GitHub repository (replace USERNAME with your GitHub username and REPO with your repository name)
git remote add origin https://github.com/USERNAME/REPO.git

# Push to GitHub
git push -u origin main
```

Note: If you're using an older version of Git, you might need to use `master` instead of `main`.

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings"
3. Scroll down to the "GitHub Pages" section
4. Under "Source", select "main" branch and root folder (/)
5. Click "Save"
6. After a few minutes, your site will be available at `https://USERNAME.github.io/REPO`

## Step 5: Check Your Site

- Wait a few minutes for GitHub to build and deploy your site
- Visit `https://USERNAME.github.io/REPO` to see your Skin Viewer in action
- If any images don't load, make sure the paths in your code match the actual file paths in your repository

## Troubleshooting

### Images Not Loading
- Check that your Sprite folder is correctly capitalized
- Make sure all image paths are correct in the JavaScript code
- Verify that all images were uploaded to GitHub

### JSON File Issues
- Ensure skin_tags.json was correctly uploaded
- Check for any JSON syntax errors
- Make sure the fetch URL in script.js matches the actual file location

### Site Not Updating
- It may take a few minutes for changes to propagate
- Check your repository settings to ensure Pages is correctly configured
- Look for any build errors in the Pages section of your repository settings

## Final Notes

- GitHub Pages has limitations on bandwidth and storage, but it's sufficient for most small to medium applications
- For larger applications or commercial use, consider a dedicated web hosting service 