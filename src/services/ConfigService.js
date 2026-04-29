export const loadProjectConfig = async (projectId) => {
  try {
    const data = await import(`../config/${projectId}.json`);
    return data.default;
  } catch (err) {
    console.warn(`Config not found for ${projectId}, loading default...`);
    try {
      const fallbackConfig = await import(`../config/default_Braingrades.json`);
      return fallbackConfig.default;
    } catch (fallbackErr) {
      console.error("Default config bhi nahi mili:", fallbackErr);
      return null;
    }
  }
};