import { JsonMap } from "../core/types.js";
import { SynologyClient } from "../core/synology-client.js";

export class FileStationService {
  constructor(private readonly client: SynologyClient) {}

  async list(path: string, additional: JsonMap = {}) {
    if (path === "/" || path.trim() === "") {
      return this.client.call("SYNO.FileStation.List", "list_share", 2, {
        offset: 0,
        limit: 1000,
        additional: JSON.stringify(["real_path", "size", "time", "owner", "perm"]),
        ...additional,
      }, undefined, "FileStation");
    }

    return this.client.call("SYNO.FileStation.List", "list", 2, {
      folder_path: path,
      additional: JSON.stringify(["real_path", "size", "time", "owner", "perm"]),
      ...additional,
    }, undefined, "FileStation");
  }

  async search(folderPath: string, pattern: string) {
    return this.client.call("SYNO.FileStation.Search", "start", 2, {
      folder_path: folderPath,
      pattern,
      recursive: true,
    }, undefined, "FileStation");
  }

  async makeDir(parentPath: string, name: string) {
    return this.client.call("SYNO.FileStation.CreateFolder", "create", 2, {
      folder_path: parentPath,
      name,
      force_parent: true,
    }, undefined, "FileStation");
  }

  async rename(path: string, name: string) {
    return this.client.call("SYNO.FileStation.Rename", "rename", 2, {
      path,
      name,
    }, undefined, "FileStation");
  }

  async copyMove(sourcePaths: string[], destinationPath: string, removeSource: boolean) {
    return this.client.call("SYNO.FileStation.CopyMove", "start", 3, {
      path: JSON.stringify(sourcePaths),
      dest_folder_path: destinationPath,
      remove_src: removeSource,
      overwrite: false,
    }, undefined, "FileStation");
  }

  async delete(paths: string[]) {
    return this.client.call("SYNO.FileStation.Delete", "start", 2, {
      path: JSON.stringify(paths),
      accurate_progress: true,
    }, undefined, "FileStation");
  }
}
