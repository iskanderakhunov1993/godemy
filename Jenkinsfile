pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  parameters {
    booleanParam(name: 'RUN_DEPLOY', defaultValue: true, description: 'Run deploy stage for main branch')
    string(name: 'DEPLOY_HOST', defaultValue: '', description: 'Production server host or IP')
    string(name: 'DEPLOY_PATH', defaultValue: '/opt/golanger', description: 'Project path on target server')
    string(name: 'SSH_CREDENTIALS_ID', defaultValue: 'golanger-ssh-key', description: 'Jenkins SSH key credentials ID')
    string(name: 'STAGING_DEPLOY_HOST', defaultValue: '72.56.232.70', description: 'Staging server host or IP')
    string(name: 'STAGING_DEPLOY_PATH', defaultValue: '/opt/golanger-staging', description: 'Project path on staging server')
    string(name: 'STAGING_SSH_CREDENTIALS_ID', defaultValue: 'golanger-staging-ssh-key', description: 'Jenkins SSH key credentials ID for staging')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Prepare env files') {
      steps {
        sh '''
          set -euo pipefail
          [ -f backend/.env ] || cp backend/.env.example backend/.env
          [ -f frontend/.env ] || cp frontend/.env.example frontend/.env
        '''
      }
    }

    stage('Build frontend') {
      steps {
        sh '''
          set -euo pipefail
          docker run --rm \
            -v "$PWD/frontend:/app" \
            -w /app \
            node:20-alpine \
            sh -lc "npm ci && npm run build"
        '''
      }
    }

    stage('Build backend') {
      steps {
        sh '''
          set -euo pipefail
          docker run --rm \
            -v "$PWD/backend:/app" \
            -w /app \
            golang:1.26-alpine \
            sh -lc "go mod download && go build ./..."
        '''
      }
    }

    stage('Build production images') {
      when {
        branch 'main'
      }
      steps {
        sh '''
          set -euo pipefail
          docker compose -f docker-compose.prod.yml build backend frontend
        '''
      }
    }

    stage('Build staging images') {
      when {
        branch 'develop'
      }
      steps {
        sh '''
          set -euo pipefail
          docker compose -f docker-compose.staging.yml build backend frontend
        '''
      }
    }

    stage('Deploy to staging') {
      when {
        allOf {
          branch 'develop'
          expression { return params.STAGING_DEPLOY_HOST?.trim() }
        }
      }
      steps {
        withCredentials([
          sshUserPrivateKey(
            credentialsId: params.STAGING_SSH_CREDENTIALS_ID,
            keyFileVariable: 'SSH_KEY',
            usernameVariable: 'SSH_USER'
          )
        ]) {
          sh '''
            set -euo pipefail
            ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@${STAGING_DEPLOY_HOST}" <<EOF
            set -euo pipefail
            cd "${STAGING_DEPLOY_PATH}"
            git pull --ff-only
            docker compose --env-file .env.staging -f docker-compose.staging.yml up -d --build
            docker image prune -f
            EOF
          '''
        }
      }
    }

    stage('Deploy to production') {
      when {
        allOf {
          branch 'main'
          expression { return params.RUN_DEPLOY }
          expression { return params.DEPLOY_HOST?.trim() }
        }
      }
      steps {
        withCredentials([
          sshUserPrivateKey(
            credentialsId: params.SSH_CREDENTIALS_ID,
            keyFileVariable: 'SSH_KEY',
            usernameVariable: 'SSH_USER'
          )
        ]) {
          sh '''
            set -euo pipefail
            ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@${DEPLOY_HOST}" <<EOF
            set -euo pipefail
            cd "${DEPLOY_PATH}"
            git pull --ff-only
            docker compose -f docker-compose.prod.yml up -d --build
            docker image prune -f
            EOF
          '''
        }
      }
    }
  }

  post {
    success {
      echo 'Pipeline completed successfully.'
    }
    failure {
      echo 'Pipeline failed. Check build logs for details.'
    }
  }
}
