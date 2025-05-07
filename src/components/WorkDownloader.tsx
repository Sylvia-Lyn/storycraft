import { saveAs } from 'file-saver'

interface DownloadOptions {
  type: 'work' | 'character' | 'host' | 'material'
  workName: string
  characterName?: string
  downloadType?: 'draft' | 'final' | 'all'
}

export const downloadWork = async ({ type, workName, characterName, downloadType = 'all' }: DownloadOptions) => {
  try {
    switch (type) {
      case 'work':
        // 下载整个作品
        await downloadOutline(workName)
        if (downloadType === 'all') {
          await downloadAllCharacterScripts(workName)
          await downloadHostManual(workName)
          await downloadMaterials(workName)
        }
        break
      
      case 'character':
        // 下载角色剧本
        if (characterName) {
          if (downloadType === 'draft' || downloadType === 'all') {
            await downloadCharacterScript(workName, characterName, 'draft')
          }
          if (downloadType === 'final' || downloadType === 'all') {
            await downloadCharacterScript(workName, characterName, 'final')
          }
        }
        break
      
      case 'host':
        // 下载主持人手册
        await downloadHostManual(workName)
        break
      
      case 'material':
        // 下载物料
        await downloadMaterials(workName)
        break
    }
  } catch (error) {
    console.error('Download failed:', error)
    throw error
  }
}

// 下载大纲
const downloadOutline = async (workName: string) => {
  const content = await getMockContent('outline', workName)
  const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  saveAs(blob, '《大纲》.docx')
}

// 下载所有角色剧本
const downloadAllCharacterScripts = async (workName: string) => {
  // 这里应该从后端获取角色列表
  const mockCharacters = ['角色1', '角色2']
  for (const char of mockCharacters) {
    await downloadCharacterScript(workName, char, 'draft')
    await downloadCharacterScript(workName, char, 'final')
  }
}

// 下载单个角色剧本
const downloadCharacterScript = async (workName: string, characterName: string, type: 'draft' | 'final') => {
  const content = await getMockContent('character', workName, characterName, type)
  const fileName = `《${characterName}${type === 'draft' ? '初稿' : '终稿'}》.docx`
  const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  saveAs(blob, fileName)
}

// 下载主持人手册
const downloadHostManual = async (workName: string) => {
  const content = await getMockContent('host', workName)
  const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  saveAs(blob, '《主持人手册》.docx')
}

// 下载物料
const downloadMaterials = async (workName: string) => {
  const content = await getMockContent('material', workName)
  const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  saveAs(blob, '《物料》.docx')
}

// 获取模拟内容
const getMockContent = async (
  type: 'outline' | 'character' | 'host' | 'material',
  workName: string,
  characterName?: string,
  scriptType?: 'draft' | 'final'
): Promise<string> => {
  // 这里应该是从后端 API 获取实际内容的逻辑
  switch (type) {
    case 'outline':
      return `
        ${workName} - 大纲
        
        背景内容：
        xxxxxxxxxxxx
        
        角色设定：
        xxxxxxxxxxxx
        
        分章剧情：
        xxxxxxxxxxxx
        
        分幕剧情：
        xxxxxxxxxxxx
      `
    
    case 'character':
      return `
        ${workName} - ${characterName} ${scriptType === 'draft' ? '初稿' : '终稿'}
        xxxxxxxxxxxx
      `
    
    case 'host':
      return `
        ${workName} - 主持人手册
        xxxxxxxxxxxx
      `
    
    case 'material':
      return `
        ${workName} - 物料
        xxxxxxxxxxxx
      `
    
    default:
      return ''
  }
}

export default downloadWork 