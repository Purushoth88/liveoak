/*
 * Copyright 2013 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Eclipse Public License version 1.0, available at http://www.eclipse.org/legal/epl-v10.html
 */
package io.liveoak.common;

import java.util.UUID;

import io.liveoak.common.security.DefaultSecurityContext;
import io.liveoak.spi.MediaTypeMatcher;
import io.liveoak.spi.Pagination;
import io.liveoak.spi.RequestAttributes;
import io.liveoak.spi.RequestContext;
import io.liveoak.spi.RequestType;
import io.liveoak.spi.ResourceParams;
import io.liveoak.spi.ResourcePath;
import io.liveoak.spi.ResourceRequest;
import io.liveoak.spi.ReturnFields;
import io.liveoak.spi.Sorting;
import io.liveoak.spi.state.ResourceState;

/**
 * @author Bob McWhirter
 */
public class DefaultResourceRequest implements ResourceRequest {

    private DefaultResourceRequest(RequestType type, ResourcePath path) {
        if (type == null) {
            throw new IllegalArgumentException("requestType is null");
        }
        if (path == null) {
            throw new IllegalArgumentException("resourcePath is null");
        }
        this.requestType = type;
        this.resourcePath = path;
        this.requestId = UUID.randomUUID();
    }

    private DefaultResourceRequest(ResourceRequest original) {
        this.requestType = original.requestType();
        this.resourcePath = original.resourcePath();
        this.requestId = original.requestId();
    }

    public UUID requestId() {
        return this.requestId;
    }

    public RequestType requestType() {
        return this.requestType;
    }

    public ResourcePath resourcePath() {
        return this.resourcePath;
    }

    public MediaTypeMatcher mediaTypeMatcher() {
        return this.mediaTypeMatcher;
    }

    public ResourceState state() {
        return this.state;
    }

    public RequestContext requestContext() {
        return this.requestContext;
    }

    public String toString() {
        return "[DefaultResourceRequest: type=" + this.requestType() + "; path=" + this.resourcePath + "]";
    }

    private UUID requestId;
    private RequestType requestType;
    private ResourcePath resourcePath;
    private MediaTypeMatcher mediaTypeMatcher;
    private ResourceState state;
    private RequestContext requestContext;

    public static class Builder {

        private DefaultResourceRequest obj;

        private ResourceParams params;
        private ReturnFields returnFields;
        private Pagination pagination;
        private RequestAttributes requestAttributes;
        private Sorting sorting;

        public Builder(RequestType type, ResourcePath path) {
            obj = new DefaultResourceRequest(type, path);
        }

        public Builder(ResourceRequest original) {
            obj = new DefaultResourceRequest(original);
            mediaTypeMatcher(original.mediaTypeMatcher());
            pagination(original.requestContext().pagination());
            resourceState(original.state());
        }

        public Builder resourceParams(ResourceParams params) {
            if (obj.requestContext != null) {
                throw new IllegalStateException("requestContext has been set already!");
            }
            this.params = params;
            return this;
        }

        public Builder mediaTypeMatcher(MediaTypeMatcher mediaTypeMatcher) {
            obj.mediaTypeMatcher = mediaTypeMatcher;
            return this;
        }

        public Builder pagination(Pagination pagination) {
            if (obj.requestContext != null) {
                throw new IllegalStateException("requestContext has been set already!");
            }
            this.pagination = pagination;
            return this;
        }

        public Builder resourceState(ResourceState state) {
            obj.state = state;
            return this;
        }

        public Builder returnFields(ReturnFields fields) {
            if (obj.requestContext != null) {
                throw new IllegalStateException("requestContext has been set already!");
            }
            this.returnFields = fields;
            return this;
        }

        public Builder requestAttributes(RequestAttributes reqAttributes) {
            if (obj.requestContext != null) {
                throw new IllegalStateException("requestContext has been set already!");
            }
            this.requestAttributes = reqAttributes;
            return this;
        }

        public Builder requestAttribute(String attributeName, Object attributeValue) {
            if (obj.requestContext != null) {
                throw new IllegalStateException("requestContext has been set already!");
            }
            if (this.requestAttributes == null) {
                this.requestAttributes = new DefaultRequestAttributes();
            }
            this.requestAttributes.setAttribute(attributeName, attributeValue);
            return this;
        }

        public Builder requestContext(RequestContext requestContext) {
            if (params != null) {
                throw new IllegalStateException("params has already been set!");
            }
            if (returnFields != null) {
                throw new IllegalStateException("returnFields has already been set!");
            }
            if (pagination != null) {
                throw new IllegalStateException("pagination has already been set!");
            }
            if (requestAttributes != null) {
                throw new IllegalStateException("requestAttributes has already been set!");
            }
            if (sorting != null) {
                throw new IllegalStateException("sorting has already been set!");
            }

            obj.requestContext = requestContext;
            return this;
        }

        public Builder sorting(Sorting sorting) {
            if (obj.requestContext != null) {
                throw new IllegalStateException("requestContext has been set already!");
            }
            this.sorting = sorting;
            return this;
        }

        public DefaultResourceRequest build() {
            if (obj.mediaTypeMatcher == null) {
                obj.mediaTypeMatcher = new DefaultMediaTypeMatcher("application/json");
            }

            if (obj.requestContext == null) {
                if (pagination == null) {
                    pagination = Pagination.NONE;
                }
                if (params == null) {
                    params = ResourceParams.NONE;
                }
                if (requestAttributes == null) {
                    requestAttributes = new DefaultRequestAttributes();
                }
                if (returnFields == null) {
                    returnFields = ReturnFields.ALL;
                }

                // TODO: introduce Sorting.NONE to be in line with others
                obj.requestContext = new DefaultRequestContext(new DefaultSecurityContext(), pagination, returnFields, params,
                        obj.resourcePath, obj.requestType, requestAttributes, sorting);
            }
            return obj;
        }
    }
}
