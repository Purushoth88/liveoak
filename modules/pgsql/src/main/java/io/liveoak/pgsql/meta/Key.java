package io.liveoak.pgsql.meta;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Key {
    private List<Column> cols;

    Key(List<Column> cols) {
        if (cols != null) {
            this.cols = Collections.unmodifiableList(new ArrayList(cols));
        }
    }

    public boolean isEmpty() {
        return cols.isEmpty();
    }

    public Column getColumn(String name) {
        for (Column c : cols) {
            if (c.name().equals(name)) {
                return c;
            }
        }
        return null;
    }

    public List<Column> columns() {
        return cols;
    }

    public int indexForColumn(String name) {
        int i = 0;
        for (Column c : cols) {
            if (c.name().equals(name)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}