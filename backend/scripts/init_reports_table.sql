CREATE TYPE report_status AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED');

CREATE TABLE Reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
    chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
    comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    reason VARCHAR(50) NOT NULL, -- Dùng để lưu giá trị từ Enum
    description TEXT,
    status report_status DEFAULT 'NEW',
    resolution_action VARCHAR(50),
    resolution_note TEXT,
    resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index để tăng tốc độ truy vấn cho Admin Dashboard
CREATE INDEX idx_reports_status ON Reports(status);
CREATE INDEX idx_reports_story ON Reports(story_id);
CREATE INDEX idx_reports_chapter ON Reports(chapter_id);
CREATE INDEX idx_reports_comment ON Reports(comment_id);
