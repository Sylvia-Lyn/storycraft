import { saveAs } from 'file-saver'

interface DownloadOptions {
  type: 'work' | 'character' | 'host' | 'material'
  workName: string
  characterName?: string
}

export const downloadWork = async ({ type, workName, characterName }: DownloadOptions) => {
  try {
    // 这里应该是从后端 API 获取数据的逻辑
    // 目前使用模拟数据
    const content = await getMockContent(type, workName, characterName)
    
    // 根据不同类型生成不同的文件名
    const filename = getFileName(type, workName, characterName)
    
    // 创建 Blob 对象并下载
    const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    saveAs(blob, filename)
  } catch (error) {
    console.error('Download failed:', error)
    throw error
  }
}

const getFileName = (type: string, workName: string, characterName?: string): string => {
  switch (type) {
    case 'work':
      return `《大纲》.docx`
    case 'character':
      return characterName ? `《${characterName}${type === 'character' ? '初稿' : '终稿'}》.docx` : '角色剧本.docx'
    case 'host':
      return '《主持人手册》.docx'
    case 'material':
      return '《物料》.docx'
    default:
      return `${workName}.docx`
  }
}

const getMockContent = async (type: string, workName: string, characterName?: string): Promise<string> => {
  // 这里应该是从后端 API 获取实际内容的逻辑
  // 目前返回模拟数据
  return `
    ${workName}
    ${type === 'work' ? '大纲内容...' : ''}
    ${type === 'character' ? `${characterName}角色剧本内容...` : ''}
    ${type === 'host' ? '主持人手册内容...' : ''}
    ${type === 'material' ? '物料内容...' : ''}
  `
}

export default downloadWork 