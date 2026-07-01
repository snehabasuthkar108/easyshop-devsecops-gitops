pipeline {

    agent any

    environment {

        DOCKER_IMAGE_NAME = "sneha108/easy-shop-app"
        DOCKER_MIGRATION_IMAGE_NAME = "sneha108/easy-shop-migration"

        IMAGE_TAG = "${BUILD_NUMBER}"

        DOCKER_CREDENTIALS = "docker-hub-creds"

        SONARQUBE_SERVER = "sonar"

        GIT_REPO = "https://github.com/snehabasuthkar108/easyshop-devsecops-gitops.git"
    }

    stages {

        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: "${GIT_REPO}"
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Unit Tests') {
            steps {
                sh 'npm test || true'
            }
        }

        stage('SonarQube Analysis') {
    steps {
        script {
            def scannerHome = tool 'sonar'

            withSonarQubeEnv('sonar') {
                sh """
                ${scannerHome}/bin/sonar-scanner \
                -Dsonar.projectKey=easyshop \
                -Dsonar.projectName=easyshop \
                -Dsonar.sources=. \
                -Dsonar.host.url=\$SONAR_HOST_URL \
                -Dsonar.login=\$SONAR_AUTH_TOKEN
                """
            }
        }
    }
}

        stage('Trivy File System Scan') {

            steps {

                sh '''
                trivy fs . \
                --severity HIGH,CRITICAL \
                --no-progress
                '''
            }
        }

        stage('Build Application Image') {

            steps {

                sh """
                docker build \
                -t ${DOCKER_IMAGE_NAME}:${IMAGE_TAG} .
                """
            }
        }

        stage('Trivy Image Scan') {

            steps {

                sh """
                trivy image \
                ${DOCKER_IMAGE_NAME}:${IMAGE_TAG} \
                --severity HIGH,CRITICAL \
                --no-progress
                """
            }
        }

        stage('Push Image to DockerHub') {

            steps {

                withDockerRegistry(
                    credentialsId: "${DOCKER_CREDENTIALS}",
                    url: ''
                ) {

                    sh """
                    docker push ${DOCKER_IMAGE_NAME}:${IMAGE_TAG}
                    docker tag ${DOCKER_IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_IMAGE_NAME}:latest
                    docker push ${DOCKER_IMAGE_NAME}:latest
                    """
                }
            }
        }

        stage('Update Kubernetes Manifest') {

            steps {

                sh """
                sed -i 's|image: .*|image: ${DOCKER_IMAGE_NAME}:${IMAGE_TAG}|g' kubernetes/08-easyshop-deployment.yaml
                """
            }
        }

        stage('Commit Manifest Changes') {

            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'github-credentials',
                        usernameVariable: 'GIT_USERNAME',
                        passwordVariable: 'GIT_PASSWORD'
                    )
                ]) {

                    sh '''
                    git config user.email "snehabasuthkar108@gmail.com"
                    git config user.name "Jenkins CI"

                    git add .

                    git commit -m "Update image tag to ${IMAGE_TAG}" || true

                    git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/snehabasuthkar108/easyshop-devsecops-gitops.git HEAD:main
                    '''
                }
            }
        }
    }
}
