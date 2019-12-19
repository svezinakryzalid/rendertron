/*
 * Copyright 2019 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 not
 * use this file except in compliance with the License. You may obtain a copy
 of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 under
 * the License.
 */

'use strict';

import * as Koa from 'koa';
import * as fse from 'fs-extra';
import * as path from 'path';
import { Md5 } from "md5-typescript";

const CACHE_PATH = path.resolve(__dirname, 'cache/');

export const CACHE_MAX_ENTRIES = 100;

// implements a cache that uses the "least-recently used" strategy to clear unused elements.
export class DiskCache {

  async clearCache() {

  }

  cacheContent(key: string, headers: { [key: string]: string }, payload: Buffer) {
    //remove refreshCache from URL
    let cacheKey = key
      .replace(/&?refreshCache=(?:true|false)&?/i, '');

    if (cacheKey.charAt(cacheKey.length - 1) === '?') {
      cacheKey = cacheKey.slice(0, -1);
    }

    //md5 the cache key
    let md5edKey = Md5.init(cacheKey);

    let cacheFile = CACHE_PATH + "/" + md5edKey + ".json";
    let cacheContent = JSON.stringify({
      saved: new Date(),
      headers: headers,
      payload: payload
    })
    fse.writeFileSync(cacheFile, cacheContent);


  }

  getCachedContent(ctx: Koa.Context, key: string) {

    let md5edKey = Md5.init(key);

    if (ctx.query.refreshCache) {
      return;
    }

    let entry = false;
    let cacheFile = CACHE_PATH + "/" + md5edKey + ".json";
    if (fse.pathExistsSync(cacheFile)) {
      entry = fse.readJsonSync(cacheFile);
    }

    return entry;
  }

  middleware() {
    return this.handleRequest.bind(this);
  }

  private async handleRequest(ctx: Koa.Context, next: () => Promise<unknown>) {
    // Cache based on full URL. This means requests with different params are
    // cached separately.
    const cacheKey = ctx.url;

    let cachedContent: any;
    cachedContent = this.getCachedContent(ctx, cacheKey);
    if (cachedContent) {
      console.log(cachedContent.saved);
      const headers = cachedContent.headers;
      ctx.set(headers);
      let saved = new Date(cachedContent.saved);
      ctx.set('x-rendertron-cached', saved.toUTCString());
      try {
        let payload = cachedContent.payload;
        if (payload && typeof (payload) === 'object' &&
          payload.type === 'Buffer') {
          payload = new Buffer(payload);
        }
        ctx.body = payload;
        return;
      } catch (error) {
        console.log(
          'Erroring parsing cache contents, falling back to normal render');
      }
    }

    await next();

    if (ctx.status === 200) {
      this.cacheContent(cacheKey, ctx.response.headers, ctx.body);
    }
  }
}
