const { request } = require('./request.js')

const API = {
  auth: {
    login(phoneNumber) {
      return request({
        url: '/auth/login',
        method: 'POST',
        data: { phone: phoneNumber, password: '123456' }
      })
    },
    register(phoneNumber, password, nickname) {
      return request({
        url: '/auth/register',
        method: 'POST',
        data: {
          phone: phoneNumber,
          password,
          nickname: nickname || `用户${String(phoneNumber).slice(-4)}`
        }
      })
    },
    resetPassword(phone, newPassword) {
      return request({
        url: '/auth/reset-password',
        method: 'POST',
        data: { phone, new_password: newPassword }
      })
    },
    updatePassword(oldPassword, newPassword) {
      return request({
        url: '/auth/update-password',
        method: 'POST',
        data: { old_password: oldPassword, new_password: newPassword }
      })
    }
  },

  assessment: {
    getScales() {
      return request({
        url: '/assessment/scales',
        method: 'GET'
      })
    },
    
    getScaleQuestions(scaleId, ageGroup) {
      return request({
        url: `/assessment/scales/${scaleId}/questions`,
        method: 'GET',
        data: { age_group: ageGroup }
      })
    },
    
    submitAssessment(assessmentData) {
      return request({
        url: '/assessment/submit',
        method: 'POST',
        data: assessmentData
      })
    },
    
    getAssessmentHistory(userId) {
      return request({
        url: `/assessment/history/${userId}`,
        method: 'GET'
      })
    },
    
    getAssessmentDetail(assessmentId) {
      return request({
        url: `/assessment/${assessmentId}`,
        method: 'GET'
      })
    }
  },

  tasks: {
    getAllTasks() {
      return request({
        url: '/tasks',
        method: 'GET'
      })
    },
    
    getTaskDetail(taskId) {
      return request({
        url: `/tasks/${taskId}`,
        method: 'GET'
      })
    },
    
    recommendTasks(userId, babyId, count = 5) {
      return request({
        url: '/tasks/recommend',
        method: 'POST',
        data: { user_id: userId, baby_id: babyId, count }
      })
    },
    
    startTask(userId, babyId, taskId) {
      return request({
        url: '/tasks/start',
        method: 'POST',
        data: { user_id: userId, baby_id: babyId, task_id: taskId }
      })
    },
    
    completeTask(userTaskId, rating, feedback) {
      return request({
        url: '/tasks/complete',
        method: 'POST',
        data: { user_task_id: userTaskId, rating, feedback }
      })
    },
    
    getUserTasks(userId, babyId) {
      return request({
        url: `/tasks/user/${userId}/baby/${babyId}`,
        method: 'GET'
      })
    }
  },

  coze: {
    chat(userInput, conversationId) {
      const data = { user_input: userInput }
      if (conversationId) {
        data.conversation_id = conversationId
      }
      return request({
        url: '/coze/chat',
        method: 'POST',
        data
      })
    }
  }
}

module.exports = API