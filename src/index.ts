import type { Root, Text, Link } from 'mdast';
import { visit } from 'unist-util-visit';

// Default aspect ratio of 16:9
const DEFAULT_HEIGHT = 315;
const URL_PATTERN = /^https:\/\/(?:youtu\.be\/|www\.youtube\.com\/watch\?v=)([0-9A-Za-z_-]+)$/;

interface Options {
  width?: string | number;
  height?: number;
  responsive?: boolean;
}

const remarkYoutubePlugin = (options?: Options) => (tree: Root) => {
  visit(tree, 'paragraph', (node) => {
    let videoId = '';
    let videoUrl = '';
    for (const child of node.children) {
      // parse type = 'link' for 'remark-gfm'
      if (child.type === 'text' || child.type === 'link') {
        const url = (child as Link)?.url ?? (child as Text)?.value;
        const match = url.match(URL_PATTERN);
        if (match && match[1]) {
          videoId = match[1];
          videoUrl = url;
          break;
        }
      }
    }
    if (videoId && videoUrl) {
      // Set default properties for iframe
      const iframeProperties: Record<string, any> = {
        src: `https://www.youtube.com/embed/${videoId}`,
        frameborder: '0',
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
        allowfullscreen: true,
      };
      
      // Handle responsive option
      if (options?.responsive !== false) {
        // Set width to 100% for responsive behavior
        iframeProperties.width = '100%';
        iframeProperties.height = options?.height ?? DEFAULT_HEIGHT;
        iframeProperties.style = 'max-width: 100%;';
      } else {
        // Use fixed dimensions if responsive is false
        iframeProperties.width = options?.width ?? '100%';
        iframeProperties.height = options?.height ?? DEFAULT_HEIGHT;
      }

      const text: Text = {
        type: 'text',
        value: videoUrl,
        data: {
          hName: 'iframe',
          hProperties: iframeProperties,
          hChildren: [],
        },
      };
      node.children = [text];
    }
  });
};

export default remarkYoutubePlugin;