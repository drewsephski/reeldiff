# Video Generation Test

This file was created to test the automated video generation feature.

## Test Details
- **Branch**: test-video-trigger
- **Purpose**: Trigger video generation via PR merge webhook
- **Source**: This should create a video with `source: 'webhook'` in the database

## Expected Behavior
1. PR is created with this file
2. PR is merged to main
3. GitHub webhook fires
4. Video record created with source='webhook'
5. Video generation task triggered
6. Video appears in dashboard with GitHub badge
# Test Merge 2 - Mon Apr 13 18:04:28 CDT 2026
