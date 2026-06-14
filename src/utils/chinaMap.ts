import * as echarts from 'echarts';

const chinaGeoJSON = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: { name: '黑龙江', adcode: 230000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[121, 53], [135, 53], [135, 43], [121, 43], [121, 53]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '吉林', adcode: 220000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[121, 46], [131, 46], [131, 40], [121, 40], [121, 46]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '辽宁', adcode: 210000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[119, 43], [125, 43], [125, 38], [119, 38], [119, 43]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '内蒙古', adcode: 150000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[97, 53], [126, 53], [126, 37], [97, 37], [97, 53]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '新疆', adcode: 650000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[73, 49], [96, 49], [96, 34], [73, 34], [73, 49]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '西藏', adcode: 540000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[78, 36], [99, 36], [99, 26], [78, 26], [78, 36]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '青海', adcode: 630000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[89, 39], [103, 39], [103, 31], [89, 31], [89, 39]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '甘肃', adcode: 620000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[92, 42], [108, 42], [108, 32], [92, 32], [92, 42]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '宁夏', adcode: 640000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[104, 39], [107, 39], [107, 35], [104, 35], [104, 39]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '陕西', adcode: 610000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[105, 39], [111, 39], [111, 31], [105, 31], [105, 39]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '山西', adcode: 140000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[110, 40], [114, 40], [114, 34], [110, 34], [110, 40]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '河北', adcode: 130000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[113, 42], [119, 42], [119, 36], [113, 36], [113, 42]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '北京', adcode: 110000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[115.4, 41], [117.5, 41], [117.5, 39.4], [115.4, 39.4], [115.4, 41]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '天津', adcode: 120000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[116.7, 40.2], [118, 40.2], [118, 38.6], [116.7, 38.6], [116.7, 40.2]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '山东', adcode: 370000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[114, 38], [122, 38], [122, 34], [114, 34], [114, 38]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '河南', adcode: 410000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[110, 36], [116, 36], [116, 31], [110, 31], [110, 36]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '江苏', adcode: 320000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[116, 35], [122, 35], [122, 30], [116, 30], [116, 35]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '安徽', adcode: 340000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[114, 34], [119, 34], [119, 29], [114, 29], [114, 34]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '上海', adcode: 310000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[120.8, 31.9], [122, 31.9], [122, 30.6], [120.8, 30.6], [120.8, 31.9]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '湖北', adcode: 420000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[108, 33], [116, 33], [116, 29], [108, 29], [108, 33]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '浙江', adcode: 330000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[118, 31], [123, 31], [123, 27], [118, 27], [118, 31]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '江西', adcode: 360000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[113, 30], [118, 30], [118, 24], [113, 24], [113, 30]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '湖南', adcode: 430000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[108, 30], [114, 30], [114, 24], [108, 24], [108, 30]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '福建', adcode: 350000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[116, 28], [120, 28], [120, 23], [116, 23], [116, 28]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '台湾', adcode: 710000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[120, 25.5], [122, 25.5], [122, 21.8], [120, 21.8], [120, 25.5]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '广东', adcode: 440000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[109, 25.5], [117, 25.5], [117, 20], [109, 20], [109, 25.5]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '广西', adcode: 450000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[104, 26], [112, 26], [112, 20], [104, 20], [104, 26]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '海南', adcode: 460000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[108.5, 20.2], [111.2, 20.2], [111.2, 18.1], [108.5, 18.1], [108.5, 20.2]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '香港', adcode: 810000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[113.8, 22.6], [114.4, 22.6], [114.4, 22.1], [113.8, 22.1], [113.8, 22.6]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '澳门', adcode: 820000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[113.5, 22.25], [113.62, 22.25], [113.62, 22.08], [113.5, 22.08], [113.5, 22.25]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '四川', adcode: 510000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[97, 34], [108, 34], [108, 26], [97, 26], [97, 34]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '重庆', adcode: 500000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[105, 32], [110, 32], [110, 28], [105, 28], [105, 32]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '贵州', adcode: 520000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[103, 29], [109, 29], [109, 24], [103, 24], [103, 29]]],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: '云南', adcode: 530000 },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[[97, 29], [106, 29], [106, 21], [97, 21], [97, 29]]],
      },
    },
  ],
};

export function registerChinaMap(): void {
  echarts.registerMap('china', chinaGeoJSON as unknown as Parameters<typeof echarts.registerMap>[1]);
}
