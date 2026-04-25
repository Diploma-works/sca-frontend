import {useEffect, useState} from "react";

import {Skeleton, Stack} from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import WysiwygIcon from '@mui/icons-material/Wysiwyg';

import {Editor, TabsContextProvider} from "../components/Editor";
import {Problems, ProblemsContextProvider} from "../components/Problems";
import {LeftSidebar, SidebarContextProvider} from "../components/LeftSidebar";
import {useSidebarStateContext} from "../components/LeftSidebar";
import {ProjectStructure, ProjectStructureContextProvider} from "../components/ProjectStructure";
import {Statistics} from "../components/Statistics";
import SystemDesign from "../components/SystemDesign/SystemDesign"

const defaultTabs = [
  {
    id: "Editor.jsx",
    label: "Editor.jsx",
    path: [
      {
        id: "src",
        label: "src"
      },
      {
        id: "components",
        label: "components"
      },
      {
        id: "Editor",
        label: "Editor"
      }
    ]
  },
  {
    id: "index1.js",
    label: "index.js",
    path: [
      {
        id: "src",
        label: "src"
      },
      {
        id: "components",
        label: "components"
      },
      {
        id: "Editor",
        label: "Editor"
      }
    ]
  },
  {
    id: "utils",
    label: "utils.ts",
    path: [
      {
        id: "src",
        label: "src"
      },
      {
        id: "themes",
        label: "themes"
      }
    ]
  },
  {
    id: "index.html",
    label: "index.html",
    path: [
      {
        id: "public",
        label: "public"
      }
    ]
  },
  {
    id: "logo512.jpg",
    label: "logo512.jpg",
    path: [
      {
        id: "public",
        label: "public"
      }
    ]
  },
  {
    id: "manifest.json",
    label: "manifest.json",
    path: [
      {
        id: "public",
        label: "public"
      }
    ]
  },
  {
    id: "robots.txt",
    label: "robots.txt",
    path: [
      {
        id: "public",
        label: "public"
      }
    ]
  },
  {
    id: "main.css",
    label: "main.css",
    path: [
      {
        id: "styles",
        label: "styles"
      },
      {
        id: "css",
        label: "css"
      }
    ]
  },
];

const tools = [
  {
    title: "Файлы проекта",
    icon: <FolderOutlinedIcon/>,
    component: <ProjectStructure/>
  },
  {
    title: "Статистика",
    icon: <QueryStatsRoundedIcon/>,
    component: <Statistics/>
  },
  {
    title: "Проблемы",
    icon: <ErrorOutlineRoundedIcon/>,
    component: <Problems/>
  },
  {
    title: 'Проектирование системы',
    icon: <WysiwygIcon/>,
    component: <SystemDesign/>,
    fullscreen: true,
  }
];

const SYSTEM_DESIGN_INDEX = tools.findIndex(t => t.fullscreen);

const MainContent = () => {
  const activeTool = useSidebarStateContext();
  const isFullscreen = activeTool === SYSTEM_DESIGN_INDEX;

  return (
    <>
      <LeftSidebar tools={tools}/>
      {!isFullscreen && <Editor/>}
    </>
  );
};

const Main = () => {
  const [isLoading, setIsLoading] = useState(true); // TODO: заменить?

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  return (
    <TabsContextProvider defaultTabs={defaultTabs} defaultActiveTab={defaultTabs[0]}>
      <SidebarContextProvider>
        <ProjectStructureContextProvider>
          <ProblemsContextProvider>
            <Stack
              direction="row"
              spacing={{xs: 4 / 8, md: 1}}
              sx={{
                flex: 1,
                overflow: 'hidden',
                p: {xs: 4 / 8, md: 1},
              }}
            >
              {isLoading ? (
                <>
                  <Skeleton animation="wave" sx={{width: 36, height: 100, transform: 'none'}}/>
                  <Skeleton animation="wave" sx={{flex: 1, transform: 'none'}}/>
                </>
              ) : (
                <MainContent/>
              )}
            </Stack>
          </ProblemsContextProvider>
        </ProjectStructureContextProvider>
      </SidebarContextProvider>
    </TabsContextProvider>
  );
}

export default Main;