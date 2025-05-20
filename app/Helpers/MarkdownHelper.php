<?php

namespace App\Helpers;

use Illuminate\Support\HtmlString;
use Illuminate\Mail\Markdown;

class MarkdownHelper
{
    /**
     * Parse markdown content safely for emails.
     *
     * @param string $text
     * @return HtmlString
     */
    public static function parse($text)
    {
        return new HtmlString(Markdown::parse($text));
    }

    /**
     * Convert to plain text (strip tags).
     *
     * @param string $text
     * @return string
     */
    public static function strip($text)
    {
        return strip_tags($text);
    }
}
